<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { usernameStore, identityStore } from "../../../stores/identity";

    export let examId: string;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    let isLoading: boolean = false;
    let results: Result[] = [];

    onMount(async () => {
        isLoading = true;
        const res = await fetch(
            `http://localhost:10000/examiners/results/exams/${examId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: identityString,
                    username,
                }),
            }
        );
        if (res.ok) {
            const apiRes = await res.json();
            const resultsArr: Record<string, any>[] = apiRes.results;
            results = resultsArr.map<Result>((e) => ({
                ID: e.ID,
                Examiner: e.Examiner,
                Address: e.Address,
                Signature: e.Signature,
                RollNumber: e.RollNumber,
                AnswerSheetID: e.AnswerSheetID,
                ExamID: e.ExamID,
            }));
        } else {
            const r = await res.json();
            alert(`Error occurred: ${r.error}`);
        }
        isLoading = false;
    });
</script>

<main>
    {#if isLoading}
        <p>Loading...</p>
    {:else}
        <h1>All Results</h1>
        <table>
            <tr>
                <th>ID</th>
                <th>Answer Sheet ID</th>
                <th>Roll Number</th>
                <th>Address</th>
                <th>Signature</th>
            </tr>
            {#each results as result}
                <tr>
                    <td>{result.ID}</td>
                    <td>{result.AnswerSheetID}</td>
                    <td>{result.RollNumber}</td>
                    <td>{result.Address}</td>
                    <td>{result.Signature}</td>
                </tr>
            {/each}
        </table>
    {/if}
</main>
