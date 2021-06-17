<script lang="ts">
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
            const { identityExaminers, identityStudents } = await res.json();
            const identityExaminersBlob = new Blob([JSON.stringify(identityExaminers)], {
                type: "application/json",
            });

            const identityStudentsBlob = new Blob([JSON.stringify(identityStudents)], {
                type: "application/json",
            });

            downloadBlob(identityExaminersBlob, "admin_examiners.id");
            downloadBlob(identityStudentsBlob, "admin_students.id");
        } else {
            const r = await res.json();
            error = `Error occurred: ${r.error}`;
        }
    };
</script>

<main>
    {#if error}
        <p>{error}</p>
    {:else}
        <form on:submit|preventDefault={onSubmit}>
            <input
                type="text"
                id="username"
                name="username"
                bind:value={username}
                required
            />Username
            <input
                type="password"
                id="password"
                name="password"
                bind:value={password}
                required
            />Password
            <input type="submit" value="Submit" />
        </form>
    {/if}
</main>
