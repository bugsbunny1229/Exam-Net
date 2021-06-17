<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { usernameStore, identityStore } from "../../stores/identity";

    export let examId: string;
    let exam: Exam;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);

    onMount(async () => {
        const res = await fetch(`http://localhost:10000/exams/${examId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: identityString,
                username,
            }),
        });
        console.log(await res.json());
    });
</script>
