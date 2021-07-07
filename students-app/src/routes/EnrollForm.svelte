<script lang="ts">
    let rollNumber: string;
    let username: string;
    let name: string;
    let secret: string;
    let loading: Boolean = false;

    const onEnroll = async () => {
        loading = true;
        const res = await fetch("http://localhost:10000/enroll/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, username, secret, rollNumber }),
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
            alert(`Error occurred: ${r.error}`);
        }
        loading = false;
    };
</script>

{#if loading}
    <p>Loading...</p>
{:else}
    <p>Enroll</p>
    <form on:submit|preventDefault={onEnroll}>
        <input type="text" placeholder="Roll Number" bind:value={rollNumber} required />
        <input type="text" placeholder="name" bind:value={name} required />
        <input
            type="email"
            placeholder="username"
            bind:value={username}
            required
        />
        <input
            type="password"
            placeholder="secret"
            bind:value={secret}
            required
        />
        <button>Submit</button>
    </form>
{/if}
