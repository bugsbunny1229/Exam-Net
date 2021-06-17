<script lang="ts">
    import { get } from "svelte/store";
    import { usernameStore, identityStore } from "../../stores/identity";

    let isComplete: boolean = false;
    // let cryptoLoaded: boolean = false;
    let isLoading: boolean = false;
    let progressText: string = "Loading...";
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    let key: string;
    let paper: FileList;
    let title: string;
    let subject: string;
    let date: string;
    let duration: number;

    const onSubmit = async () => {
        isLoading = true;
        // if (cryptoLoaded) {
        const formData = new FormData();
        progressText = "Generating secure encryption key...";
        const paperBuffer: ArrayBuffer = await paper[0].arrayBuffer();
        const encryptionKey: CryptoKey = await crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );
        const secretKey: JsonWebKey = await crypto.subtle.exportKey(
            "jwk",
            encryptionKey
        );
        key = secretKey.k;
        progressText = "Encrypting file...";

        // const paperWordArray =
        //     CryptoJS.lib.WordArray.create(paperBuffer);
        // const encryptedFileString = CryptoJS.AES.encrypt(
        //     paperWordArray,
        //     secretKey.k
        // ).toString();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedBuffer: ArrayBuffer = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv,
            },
            encryptionKey,
            paperBuffer
        );
        const decoder = new TextDecoder();
        const encryptedFileString = decoder.decode(encryptedBuffer);
        progressText = "Uploading file...";
        formData.append(
            paper[0].name,
            new Blob([encryptedFileString], {
                type: "text/plain",
            }),
            paper[0].name
        );
        const infuraRes = await fetch(
            "https://ipfs.infura.io:5001/api/v0/add?quieter=true",
            {
                method: "POST",
                body: formData,
            }
        );
        const infuraRef = await infuraRes.json();
        const msgUint8 = new TextEncoder().encode(secretKey.k); // encode as (utf-8) Uint8Array
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
        const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(""); // convert bytes to hex string
        const password = hashHex;

        progressText =
            "Authenticating with CA and storing details on ledger...";
        const res = await fetch("http://localhost:10000/exams/new", {
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
            console.log(await res.json());
        } else {
            progressText = "Error occurred...";
            const r = await res.json();
            alert(`Error occurred: ${r.error}`);
        }
        isLoading = false;
        // }
    };

    // const loadCrypto = () => (cryptoLoaded = true);
</script>

<!-- <svelte:head>
    <script
        src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js"
        integrity="sha512-nOQuvD9nKirvxDdvQ9OMqe2dgapbPB7vYAMrzJihw5m+aNcf0dX53m6YxM4LgA9u8e9eg9QX+/+mPu8kCNpV2A=="
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
        on:load={loadCrypto}>
    </script>
</svelte:head> -->

{#if isLoading}
    <p>{progressText}</p>
{:else if isComplete}
    <p>Your exam password: {key}</p>
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
