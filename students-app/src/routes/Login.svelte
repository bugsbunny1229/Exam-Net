<script lang="ts">
    import Swal from "sweetalert2";
    import { usernameStore, identityStore } from "../stores/identity";

    let username: string;
    let idFile: FileList;
    let filename: string = "";

    const onFileUpload = () => {
        const identity = idFile[0];
        filename = identity.name;
    };

    const onSubmit = async () => {
        let identityString;
        const reader = new FileReader();
        reader.addEventListener("loadend", async (event) => {
            identityString = event.target.result;
            usernameStore.set(username);
            identityStore.set(identityString);
        });
        reader.readAsText(idFile[0]);
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener("mouseenter", Swal.stopTimer);
                toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
        });

        Toast.fire({
            icon: "success",
            title: "ID file read successfully",
        });
    };
</script>

<div class="h-full flex flex-col items-center justify-center">
    <form
        on:submit|preventDefault={onSubmit}
        class="mx-4 flex flex-col rounded-xl md:p-20 p-10 shadow-2xl bg-white"
    >
        <label for="email" class="mt-5 text-purple text-lg">Email</label>
        <input
            type="email"
            placeholder="Email"
            id="email"
            bind:value={username}
            class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
            required
        />
        <span class="text-purple text-lg mt-5">Your ID File</span>
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
            bind:files={idFile}
            on:change={onFileUpload}
            class="hidden"
            required
        />
        <input
            class="bg-transparent mt-10 rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="submit"
            value="Login"
        />
    </form>
</div>
