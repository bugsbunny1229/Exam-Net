<script lang="ts">
    import { usernameStore, identityStore } from "../stores/identity";
    let username: string;
    let idFile: FileList;

    const onSubmit = async () => {
        let identityString;
        const reader = new FileReader();
        reader.addEventListener("loadend", async (event) => {
            identityString = event.target.result;
            usernameStore.set(username);
            identityStore.set(identityString);
        });
        reader.readAsText(idFile[0]);
    };
</script>

<p>Login</p>
<form on:submit|preventDefault={onSubmit}>
    <input
        type="email"
        placeholder="username"
        bind:value={username}
        required
    />
    <input
        type="file"
        id="identity"
        name="identity"
        accept=".id"
        bind:files={idFile}
        required
    />Your ID file
    <button>Submit</button>
</form>
