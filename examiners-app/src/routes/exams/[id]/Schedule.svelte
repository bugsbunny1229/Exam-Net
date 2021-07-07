<script lang="ts">
    import { get } from "svelte/store";
    import { navigate } from "svelte-navigator";
    import { usernameStore, identityStore } from "../../../stores/identity";

    export let examId: string;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    let isLoading: boolean = false;
    let password: string;

    const onSchedule = async () => {
        isLoading = true;
        await fetch(`http://localhost:10000/examiners/exams/${examId}/schedule`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: identityString,
                username,
                password,
            }),
        });
        isLoading = false;
        navigate(`/exams/${examId}`);
    };
</script>

<main>
    {#if isLoading}
        <p>Loading...</p>
    {:else}
        <form on:submit|preventDefault={onSchedule}>
            <label for="password">Exam Password</label>
            <input
                type="password"
                placeholder="password"
                id="password"
                bind:value={password}
            />
            <input type="submit" value="Schedule" />
        </form>
    {/if}
</main>
