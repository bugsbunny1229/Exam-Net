<script lang="ts">
    import Swal from "sweetalert2";
    import Loader from "../Loader.svelte";

    let username: string;
    let name: string;
    let secret: string;
    let loading: Boolean = false;

    const fireError = (err) =>
        Swal.fire({
            title: "Error!",
            text: err,
            icon: "error",
            confirmButtonText: "Ok",
        });

    const onEnroll = async () => {
        loading = true;
        try {
            const res = await fetch("http://localhost:10000/enroll/examiners", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, username, secret }),
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${username.split("@")[0]}.id`;
                document.body.appendChild(a);
                a.click();
                a.remove(); // afterwards we remove the element again
                URL.revokeObjectURL(url);
            } else {
                const r = await res.json();
                fireError(`Error occurred: ${r.error}`);
            }
        } catch (err) {
            fireError(err);
        } finally {
            loading = false;
        }
    };
</script>

<div class="h-full flex flex-col items-center justify-center">
    {#if loading}
        <div class="flex flex-col items-center justify-center">
            <Loader stroke="#fff" />
        </div>
    {:else}
        <form
            on:submit|preventDefault={onEnroll}
            class="mx-4 flex flex-col rounded-xl md:p-20 p-10 shadow-2xl bg-white"
        >
            <label for="name" class="text-purple text-lg">Name</label>
            <input
                type="text"
                placeholder="Name"
                id="name"
                bind:value={name}
                class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
                required
            />
            <label for="email" class="mt-5 text-purple text-lg">Email</label>
            <input
                type="email"
                placeholder="Email"
                id="email"
                bind:value={username}
                class="text-black rounded-lg text-xl shadow-inner border-transparent focus:border-purple focus:ring-0"
                required
            />
            <label for="secret" class="mt-5 text-purple text-lg">
                Enrollment Secret
            </label>
            <input
                type="password"
                placeholder="Secret"
                id="secret"
                bind:value={secret}
                class="text-black rounded-lg shadow-inner text-xl border-transparent focus:border-purple focus:ring-0"
                required
            />
            <input
                class="bg-transparent mt-10 rounded-full cursor-pointer border border-solid text-purple border-purple hover:bg-purple hover:text-white font-bold uppercase px-8 py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="submit"
                value="Enroll"
            />
        </form>
    {/if}
</div>
