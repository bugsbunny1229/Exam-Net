<script lang="ts">
    import Swal from "sweetalert2";
    import { get } from "svelte/store";
    import Loader from "../../Loader.svelte";
    import { usernameStore, identityStore } from "../../stores/identity";

    let isLoading: boolean = false;
    let filename: string = "";
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

    const onFileUpload = () => {
        const file = paper[0];
        filename = file.name;
    };

    const fireError = (err) =>
        Swal.fire({
            title: "Error!",
            text: err,
            icon: "error",
            confirmButtonText: "Ok",
        });

    const onSubmit = async (): Promise<void> => {
        isLoading = true;
        try {
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

            progressText = "Encrypting file...";
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

            const infuraRef = await infuraRes.json();

            progressText =
                "Authenticating with CA and storing details on ledger...";
            const res = await fetch(
                "http://localhost:10000/examiners/exams/new",
                {
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
                }
            );
            if (res.ok) {
                progressText = "Done...";
                Swal.fire({
                    title: "Created exam successfully!",
                    text: `Your exam password: ${password}`,
                    icon: "success",
                    footer: "For security reasons this password is displayed only once",
                    confirmButtonText: "Ok",
                });
            } else {
                progressText = "Error occurred...";
                const r = await res.json();
                fireError(`Error occurred: ${r.error}`);
            }
        } catch (err) {
            fireError(err);
        } finally {
            isLoading = false;
        }
    };
</script>

<div class="h-full flex flex-col items-center justify-center">
    {#if isLoading}
        <div class="flex flex-col items-center justify-center">
            <Loader stroke="#fff" />
            <p class="text-xl font-bold">{progressText}</p>
        </div>
    {:else}
        <form
            on:submit|preventDefault={onSubmit}
            class="mx-4 flex flex-col rounded-xl md:p-20 p-10 shadow-2xl bg-white"
        >
            <label for="title" class="text-purple text-lg">Title</label>
            <input
                type="text"
                id="title"
                name="title"
                bind:value={title}
                class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
                required
            />
            <label for="title" class="text-purple text-lg">Subject</label>
            <input
                type="text"
                id="subject"
                name="subject"
                bind:value={subject}
                class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
                required
            />
            <label for="date" class="text-purple text-lg">Date</label>
            <input
                type="datetime-local"
                id="date"
                name="date"
                bind:value={date}
                class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
                required
            />
            <label for="duration" class="text-purple text-lg"
                >Duration (in minutes)</label
            >
            <input
                type="number"
                id="duration"
                name="duration"
                min="0"
                bind:value={duration}
                class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
                required
            />
            <span class="text-purple text-lg mt-5">Question Paper PDF</span>
            <label
                for="paper"
                class="mt-3 text-center bg-transparent rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase py-2 outline-none focus:outline-none ease-linear transition-all duration-150"
            >
                {#if filename != ""}
                    {filename.length > 30
                        ? `${filename.substring(0, 30)}...`
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
                bind:files={paper}
                on:change={onFileUpload}
                class="hidden"
                required
            />
            <input
                class="bg-transparent mt-10 rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="submit"
                value="Create Exam"
            />
        </form>
    {/if}
</div>
