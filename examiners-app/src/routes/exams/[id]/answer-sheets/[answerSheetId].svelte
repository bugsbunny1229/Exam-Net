<script lang="ts">
    import forge from "node-forge";
    import { get } from "svelte/store";
    import { usernameStore, identityStore } from "../../../../stores/identity";

    let isLoading: boolean = false;
    let decrypted: boolean = false;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    let url: string;
    const { privateKey } = JSON.parse(JSON.parse(identityString).identity);
    const { answerSheet } = history.state;

    const load = async () => {
        isLoading = true;
        const infuraRes = await fetch(
            "https://ipfs.infura.io:5001/api/v0/cat?" +
                new URLSearchParams({
                    arg: answerSheet.Address,
                }),
            {
                method: "POST",
            }
        );
        if (infuraRes.ok) {
            const encryptedBlob = await infuraRes.blob();
            const encryptedBuffer = new Uint8Array(
                await encryptedBlob.arrayBuffer()
            );
            var iterations = 10000;
            const pKey = forge.pki.privateKeyFromPem(privateKey);
            const password = pKey.decrypt(answerSheet.Key);
            var passwordBytes = new TextEncoder().encode(password);
            var pbkdf2Salt = encryptedBuffer.slice(8, 16);

            var passwordKey = await crypto.subtle.importKey(
                "raw",
                passwordBytes,
                { name: "PBKDF2" },
                false,
                ["deriveBits"]
            );

            let pbkdf2Bytes = await crypto.subtle.deriveBits(
                {
                    name: "PBKDF2",
                    salt: pbkdf2Salt,
                    iterations,
                    hash: "SHA-256",
                },
                passwordKey,
                384
            );

            pbkdf2Bytes = new Uint8Array(pbkdf2Bytes);
            const keyBytes = pbkdf2Bytes.slice(0, 32);
            const ivBytes = pbkdf2Bytes.slice(32);
            const encryptedBytes = encryptedBuffer.slice(16);

            let key = await crypto.subtle.importKey(
                "raw",
                keyBytes,
                { name: "AES-GCM", length: 256 },
                false,
                ["decrypt"]
            );

            let decryptedBytes = await crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: ivBytes,
                },
                key,
                encryptedBytes
            );

            decryptedBytes = new Uint8Array(decryptedBytes);
            const blob = new Blob([decryptedBytes], {
                type: "application/pdf",
            });
            url = URL.createObjectURL(blob);
            decrypted = true;
        }
        isLoading = false;
    };
</script>

<main>
    <button on:click={load}>Load</button>
    {#if isLoading}
        <p>Loading...</p>
    {:else if decrypted}
        <object
            data={url}
            type="application/pdf"
            title={answerSheet.RollNumber}
            width="100%"
            height="800px"
        />
    {/if}
</main>
