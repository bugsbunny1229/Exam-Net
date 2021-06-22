<script lang="ts">
    import Swal from "sweetalert2";
    import Loader from "../Loader.svelte";
    let loading = false;
    let username: string;
    let password: string;
    let error: string;

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove(); // afterwards we remove the element again
        URL.revokeObjectURL(url);
    };

    const onSubmit = async () => {
        loading = true;
        try {
            const res = await fetch("http://localhost:8080/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });
            if (res.ok) {
                const { identityExaminers, identityStudents } =
                    await res.json();
                const identityExaminersBlob = new Blob(
                    [JSON.stringify(identityExaminers)],
                    {
                        type: "application/json",
                    }
                );

                const identityStudentsBlob = new Blob(
                    [JSON.stringify(identityStudents)],
                    {
                        type: "application/json",
                    }
                );

                downloadBlob(identityExaminersBlob, "admin_examiners.id");
                downloadBlob(identityStudentsBlob, "admin_students.id");
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
        <label for="username" class="text-purple text-lg">Username</label>
        <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
            bind:value={username}
            required
        />
        <label for="password" class="mt-5 text-purple text-lg">Password</label>
        <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            class="text-black rounded-lg shadow-inner text-xl border-transparent focus:border-purple focus:ring-0"
            bind:value={password}
            required
        />
        <input
            class="bg-transparent mt-10 rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="submit"
            value="Login"
        />
        {#if loading}
            <Loader />
        {/if}
    </form>
</div>
