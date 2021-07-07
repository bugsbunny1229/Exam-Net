<script lang="ts">
    import { get } from "svelte/store";
    import { usernameStore, identityStore } from "../../stores/identity";

    let isComplete: boolean = false;
    let isLoading: boolean = false;
    let progressText: string = "Loading...";
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    let password: string;
    let paper: FileList;
    let title: string;
    let subject: string;
    let date: string;
    let duration: number;

    const generatePassword = (): string => {
        var buffer = new Uint8Array(12);
        crypto.getRandomValues(buffer);
        return btoa(String.fromCharCode.apply(null, buffer));
    };

    const onSubmit = async (): Promise<void> => {
        isLoading = true;
        progressText = "Reading file...";
        let paperBuffer = await paper[0].arrayBuffer();
        paperBuffer = new Uint8Array(paperBuffer);

        progressText = "Generating secure encryption key...";
        const PBKDF2_ITERATIONS = 10000;
        password = generatePassword();
        const passwordBytes = new TextEncoder().encode(password);
        const salt = crypto.getRandomValues(new Uint8Array(8));
        const passwordKey = await crypto.subtle.importKey(
            "raw",
            passwordBytes,
            { name: "PBKDF2" },
            false,
            ["deriveBits"]
        );

        let pbkdf2DerivedBytes: ArrayBuffer = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt,
                iterations: PBKDF2_ITERATIONS,
                hash: "SHA-256",
            },
            passwordKey,
            384
        );

        pbkdf2DerivedBytes = new Uint8Array(pbkdf2DerivedBytes);

        const keyBytes: ArrayBuffer = pbkdf2DerivedBytes.slice(0, 32);
        const ivBytes: ArrayBuffer = pbkdf2DerivedBytes.slice(32);

        const encryptionKey: CryptoKey = await window.crypto.subtle.importKey(
            "raw",
            keyBytes,
            { name: "AES-CBC", length: 256 },
            false,
            ["encrypt"]
        );

        progressText = "Encrypting file...";
        let encryptedBytes: any = await crypto.subtle.encrypt(
            { name: "AES-CBC", iv: ivBytes },
            encryptionKey,
            paperBuffer
        );

        encryptedBytes = new Uint8Array(encryptedBytes);
        const encryptedFile = new Uint8Array(encryptedBytes.length + 16);
        encryptedFile.set(new TextEncoder().encode("Salted__"));
        encryptedFile.set(salt, 8);
        encryptedFile.set(encryptedBytes, 16);

        progressText = "Uploading file...";
        const body = new FormData();
        body.append(paper[0].name, new Blob([encryptedFile]), paper[0].name);

        const infuraRes = await fetch(
            "https://ipfs.infura.io:5001/api/v0/add?quieter=true",
            {
                method: "POST",
                body,
            }
        );

        const infuraRef = await infuraRes.json();

        progressText =
            "Authenticating with CA and storing details on ledger...";
        const res = await fetch("http://localhost:10000/examiners/exams/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                subject,
                date,
                duration,
                password,
                id: identityString,
                username,
                address: infuraRef.Hash,
            }),
        });
        if (res.ok) {
            progressText = "Done...";
            isComplete = true;
        } else {
            progressText = "Error occurred...";
            const r = await res.json();
            alert(`Error occurred: ${r.error}`);
        }
        isLoading = false;
    };
</script>

{#if isLoading}
    <p>{progressText}</p>
{:else if isComplete}
    <p>Your exam password: {password}</p>
    <p>
        For security reasons this password is displayed only once. Please store
        this password safely.
    </p>
{:else}
    <form on:submit|preventDefault={onSubmit}>
        <input
            type="text"
            id="title"
            name="title"
            bind:value={title}
            required
        />Title
        <input
            type="text"
            id="subject"
            name="subject"
            bind:value={subject}
            required
        />Subject
        <input
            type="datetime-local"
            id="date"
            name="date"
            bind:value={date}
            required
        />Date
        <input
            type="number"
            id="duration"
            name="duration"
            bind:value={duration}
            required
        />Duration
        <input
            type="file"
            id="paper"
            name="paper"
            accept=".pdf"
            bind:files={paper}
            required
        />PDF
        <input type="submit" value="Submit" />
    </form>
{/if}
