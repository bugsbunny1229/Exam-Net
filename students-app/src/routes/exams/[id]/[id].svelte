<script lang="ts">
    import { get } from "svelte/store";
    import { navigate } from "svelte-navigator";
    import { usernameStore, identityStore } from "../../../stores/identity";
    import { examStore } from "../../../stores/exam";

    export let examId: string;
    let isLoading: boolean = false;
    let decrypted: boolean = false;
    let exam: Exam;
    let password: string;
    let url: string;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);

    const fetchData = async () => {
        isLoading = true;
        const res = await fetch(
            `http://localhost:10000/students/exams/${examId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: identityString,
                    username,
                    password,
                }),
            }
        );
        if (res.ok) {
            const examRes = (await res.json()).exam;
            exam = {
                ID: examRes.ID,
                Date: examRes.Date,
                Duration: examRes.Duration,
                Title: examRes.Title,
                Subject: examRes.Subject,
                Live: examRes.Live == "1",
                Examiner: examRes.Examiner,
                Password: examRes.Password,
                Address: examRes.Address,
                ExaminerKey: examRes.ExaminerKey,
            };
            examStore.set(exam);
            const infuraRes = await fetch(
                "https://ipfs.infura.io:5001/api/v0/cat?" +
                    new URLSearchParams({
                        arg: exam.Address,
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
        } else {
            decrypted = false;
        }
        isLoading = false;
    };

    const onSubmit = () => {
        navigate(`/exams/${examId}/submit`);
    };
</script>

<main>
    {#if isLoading}
        <p>Loading...</p>
    {:else if !decrypted}
        <form on:submit|preventDefault={fetchData}>
            <label for="password">Exam Password</label>
            <input
                type="password"
                placeholder="Exam Password"
                id="password"
                bind:value={password}
            />
            <input type="submit" value="Open Exam" />
        </form>
    {:else}
        <object
            data={url}
            type="application/pdf"
            title={exam.Title}
            width="100%"
            height="800px"
        />
        <button on:click={onSubmit}>Submit</button>
    {/if}
</main>
