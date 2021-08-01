<script lang="ts">
    import { get } from "svelte/store";
    import { Link, navigate } from "svelte-navigator";
    import { pki } from "node-forge";
    import { examStore } from "../../stores/exam";
    import { usernameStore, identityStore } from "../../stores/identity";

    export let examId: string;
    let paper: FileList;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    const { ExaminerKey } = get(examStore);

    const generatePassword = (): string => {
        var buffer = new Uint8Array(64);
        crypto.getRandomValues(buffer);
        return btoa(String.fromCharCode.apply(null, buffer));
    };

    const onSubmit = async () => {
        try {
            let paperBuffer = await paper[0].arrayBuffer();
            paperBuffer = new Uint8Array(paperBuffer);

            const publicKey = pki.publicKeyFromPem(ExaminerKey);
            console.log("imported RSA key");

            const PBKDF2_ITERATIONS = 10000;
            const password = generatePassword();
            const passwordBytes = new TextEncoder().encode(password);
            const salt = crypto.getRandomValues(new Uint8Array(8));
            const passwordKey = await crypto.subtle.importKey(
                "raw",
                passwordBytes,
                { name: "PBKDF2" },
                false,
                ["deriveBits"]
            );

            let pbkdf2DerivedBytes: ArrayBuffer =
                await crypto.subtle.deriveBits(
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

            const encryptionKey: CryptoKey = await crypto.subtle.importKey(
                "raw",
                keyBytes,
                { name: "AES-GCM", length: 256 },
                false,
                ["encrypt"]
            );

            let encryptedBytes: any = await crypto.subtle.encrypt(
                { name: "AES-GCM", iv: ivBytes },
                encryptionKey,
                paperBuffer
            );

            encryptedBytes = new Uint8Array(encryptedBytes);
            const encryptedFile = new Uint8Array(encryptedBytes.length + 16);
            encryptedFile.set(new TextEncoder().encode("Salted__"));
            encryptedFile.set(salt, 8);
            encryptedFile.set(encryptedBytes, 16);
            console.log("Encrypted file");
            const encryptedKey = publicKey.encrypt(password);
            console.log("wrapped key: " + encryptedKey);

            console.log("Uploading file...");
            const body = new FormData();
            body.append(
                paper[0].name,
                new Blob([encryptedFile]),
                paper[0].name
            );

            const infuraRes = await fetch(
                "https://ipfs.infura.io:5001/api/v0/add?quieter=true",
                {
                    method: "POST",
                    body,
                }
            );

            const infuraRef = await infuraRes.json();
            const res = await fetch(
                `http://localhost:10000/students/submit/${examId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: identityString,
                        username,
                        key: encryptedKey,
                        examId,
                        address: infuraRef.Hash,
                    }),
                }
            );
            console.log(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const showResults = () => {
        navigate(`/exams/${examId}/results`, {
            state: {
                examId,
            },
        });
    };
</script>

<main>
    <button on:click={showResults}>Results</button>
    <form on:submit|preventDefault={onSubmit}>
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
</main>
