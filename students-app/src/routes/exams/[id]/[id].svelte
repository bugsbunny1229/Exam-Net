<script lang="ts">
    import { get } from "svelte/store";
    import { navigate } from "svelte-navigator";
    import Swal from "sweetalert2";
    import Loader from "../../../Loader.svelte";
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

    const fireError = (err) =>
        Swal.fire({
            title: "Error!",
            text: err,
            icon: "error",
            confirmButtonText: "Ok",
        });

    const fetchData = async () => {
        isLoading = true;
        try {
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
                } else {
                    fireError(
                        "Couldn't load Exam, check your internet connection"
                    );
                    decrypted = false;
                }
            } else {
                const r = await res.json();
                fireError(`Couldn't load Exam: ${r.error}`);
                decrypted = false;
            }
        } catch (err) {
            fireError(`Couldn't load exams: ${err}`);
        } finally {
            isLoading = false;
        }
    };

    const onSubmit = () => {
        navigate(`/exams/${examId}/submit`);
    };
</script>

<div class="h-full flex flex-col items-center justify-center">
    {#if isLoading}
        <div class="flex flex-col items-center justify-center">
            <Loader stroke="#fff" />
        </div>
    {:else if !decrypted}
        <form
            on:submit|preventDefault={fetchData}
            class="mx-4 flex flex-col rounded-xl md:p-20 p-10 shadow-2xl bg-white"
        >
            <label for="password" class="mt-5 text-purple text-lg">
                Exam Password
            </label>
            <input
                type="password"
                placeholder="Exam Password"
                id="password"
                class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
                bind:value={password}
            />
            <input
                type="submit"
                class="bg-transparent mt-10 rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                value="Open Exam"
            />
        </form>
    {:else}
        <div class="flex flex-col w-full h-full items-center">
            <button
                on:click={onSubmit}
                class="text-center bg-transparent rounded-full cursor-pointer border border-solid text-white border-white hover:bg-white hover:text-purple font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            >
                Submit
            </button>
            <iframe
                src={url + "#toolbar=0&scrollbar=0"}
                type="application/pdf"
                title={exam.Title}
                width="60%"
                height="100%"
                class="rounded-xl my-2"
            />
        </div>
    {/if}
</div>
