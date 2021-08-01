<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { usernameStore, identityStore } from "../../stores/identity";

    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    let isLoading: boolean = false;
    let result: Result;

    onMount(async () => {
        isLoading = true;
        const { examId } = history.state;
        const res = await fetch(
            `http://localhost:10000/students/results/${examId}`,
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
            result = apiRes.result;
            console.log(result);
        } else {
            const r = await res.json();
            alert(`Error occurred: ${r.error}`);
        }
        isLoading = false;
    });
</script>

{#if isLoading}
    <p>Loading...</p>
{:else}
    <h1>Result</h1>
    <table>
        <tr>
            <th>ID</th>
            <th>Answer Sheet ID</th>
            <th>Roll Number</th>
            <th>Address</th>
            <th>Signature</th>
        </tr>
        <tr>
            <td>{result.ID}</td>
            <td>{result.AnswerSheetID}</td>
            <td>{result.RollNumber}</td>
            <td>{result.Address}</td>
            <td>{result.Signature}</td>
        </tr>
    </table>
{/if}
