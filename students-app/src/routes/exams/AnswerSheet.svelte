<script lang="ts">
    import { get } from "svelte/store";
    import { navigate } from "svelte-navigator";
    import { pki } from "node-forge";
    import Swal from "sweetalert2";
    import { examStore } from "../../stores/exam";
    import Loader from "../../Loader.svelte";
    import { usernameStore, identityStore } from "../../stores/identity";

    export let examId: string;
    let paper: FileList;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    const { ExaminerKey } = get(examStore);
    let isLoading: boolean = false;
    let progressText: string = "";
    let filename: string = "";

    const onFileUpload = () => {
        console.log(paper);
        const file = paper[0];
        filename = file.name;
        console.log(filename);
    };

    const generatePassword = (): string => {
        var buffer = new Uint8Array(64);
        crypto.getRandomValues(buffer);
        return btoa(String.fromCharCode.apply(null, buffer));
    };

    const fireError = (err) =>
        Swal.fire({
            title: "Error!",
            text: err,
            icon: "error",
            confirmButtonText: "Ok",
        });

    const onSubmit = async () => {
        try {
            isLoading = true;
            progressText = "Loading...";
            let paperBuffer = await paper[0].arrayBuffer();
            paperBuffer = new Uint8Array(paperBuffer);

            const publicKey = pki.publicKeyFromPem(ExaminerKey);
            progressText = "imported RSA key";

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
            progressText = "Encrypted file";
            const encryptedKey = publicKey.encrypt(password);
            progressText = "Wrapped key";

            progressText = "Uploading file...";
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
            if (infuraRes.ok) {
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
                if (res.ok) {
                    Swal.fire({
                        icon: "success",
                        title: "Success!",
                        text: "Submitted answer sheet successfully",
                    });
                } else {
                    const r = await res.json();
                    fireError(`Couldn't submit answer sheet: ${r.error}`);
                }
            } else {
                fireError(
                    "Couldn't submit answer sheet. Please check your connection"
                );
            }
        } catch (err) {
            fireError(err);
        } finally {
            isLoading = false;
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

<div class="h-full flex flex-col items-center">
    {#if isLoading}
        <div class="flex flex-col items-center justify-center">
            <Loader stroke="#fff" />
            <p class="font-bold text-xl">{progressText}</p>
        </div>
    {:else}
        <div class="flex flex-col w-full h-full items-center justify-center">
            <button
                on:click={showResults}
                class="text-center bg-transparent rounded-full cursor-pointer border border-solid text-white border-white hover:bg-white hover:text-purple font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            >
                View Results
            </button>
            <form
                on:submit|preventDefault={onSubmit}
                class="mx-2 mt-10 flex flex-col rounded-xl md:p-10 p-5 shadow-2xl bg-white"
            >
                <span class="text-purple text-lg"> Answer Sheet File </span>
                <label
                    for="paper"
                    class="mt-3 text-center bg-transparent rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase py-2 outline-none focus:outline-none ease-linear transition-all duration-150"
                >
                    {#if filename != ""}
                        {filename.length > 10
                            ? `${filename.substring(0, 10)}...`
                            : filename}
                    {:else}
                        <div class="flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                            <span class="text-md ml-2">Upload</span>
                        </div>
                    {/if}
                </label>

                <input
                    type="file"
                    id="paper"
                    name="paper"
                    accept=".pdf"
                    class="hidden"
                    bind:files={paper}
                    on:change={onFileUpload}
                    required
                />
                <input
                    class="bg-transparent mt-10 rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="submit"
                    value="Submit"
                />
            </form>
        </div>
    {/if}
</div>
