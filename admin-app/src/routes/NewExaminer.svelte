<script lang="ts">
    import { Link, Router } from "svelte-navigator";

    let name: string;
    let username: string;
    let identityFile: FileList;
    let error: string;

    const onSubmit = async () => {
        const identity = identityFile[0];
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
            }
        });
        reader.readAsText(identity);
    };
</script>

<Router>
    <nav>
        <Link to="/">Go back</Link>
    </nav>
    {#if error}
        <p>{error}</p>
    {:else}
        <form on:submit|preventDefault={onSubmit}>
            <input
                type="text"
                id="name"
                name="name"
                bind:value={name}
                required
            />Name
            <input
                type="email"
                id="username"
                name="username"
                bind:value={username}
                required
            />Email
            <input
                type="file"
                id="identity"
                name="identity"
                accept=".id"
                bind:files={identityFile}
                required
            />Admin ID file
            <input type="submit" value="Submit" />
        </form>
    {/if}
</Router>
