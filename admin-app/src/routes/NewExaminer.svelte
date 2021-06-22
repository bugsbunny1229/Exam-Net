<script lang="ts">
    import Swal from "sweetalert2";
    import Loader from "../Loader.svelte";
    let name: string;
    let username: string;
    let identityFile: FileList;
    let filename: string = "";
    let loading = false;
    let error: string;

    const onFileUpload = () => {
        const identity = identityFile[0];
        filename = identity.name;
        console.log(filename);
    };

    const onSubmit = async () => {
        loading = true;
        try {
            const identity = identityFile[0];
            filename = identity.name;
            let identityString: string;
            const reader = new FileReader();
            reader.addEventListener("load", async (event) => {
                identityString = event.target.result as string;
                const res = await fetch("http://localhost:8080/examiners/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        username,
                        identity: JSON.parse(identityString),
                    }),
                });

                if (res.ok) {
                    console.log(await res.json());
                } else {
                    const r = await res.json();
                    error = `Error occurred: ${r.error}`;
                    Swal.fire({
                        title: "Error!",
                        text: error,
                        icon: "error",
                        confirmButtonText: "Ok",
                    });
                }
            });
            reader.readAsText(identity);
        } catch (e) {
            Swal.fire({
                title: "Error!",
                text: e,
                icon: "error",
                confirmButtonText: "Ok",
            });
        } finally {
            loading = false;
        }
    };
</script>

<div class="h-full flex flex-col items-center justify-center">
    <form
        on:submit|preventDefault={onSubmit}
        class="mx-4 flex flex-col rounded-xl md:p-20 p-10 shadow-2xl bg-white"
    >
        <label for="name" class="text-purple text-lg">Name</label>
        <input
            type="text"
            id="name"
            name="name"
            bind:value={name}
            class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
            placeholder="Name"
            required
        />
        <label for="username" class="mt-5 text-purple text-lg">Email</label>
        <input
            type="email"
            id="username"
            name="username"
            bind:value={username}
            class="text-black rounded-lg shadow-inner text-xl border-transparent focus:border-purple focus:ring-0"
            placeholder="Email"
            required
        />
        <span class="text-purple text-lg mt-5">Examiner Admin ID File</span>
        <label
            for="identity"
            class="mt-3 text-center bg-transparent rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase py-2 outline-none focus:outline-none ease-linear transition-all duration-150"
        >
            {#if filename != ""}
                {filename}
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
            id="identity"
            name="identity"
            accept=".id"
            bind:files={identityFile}
            on:change={onFileUpload}
            class="hidden"
            required
        />

        <input
            class="bg-transparent mt-10 rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="submit"
            value="Add Examiner"
        />
        {#if loading}
            <Loader />
        {/if}
    </form>
</div>
