<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { Link } from "svelte-navigator";
    import { usernameStore, identityStore } from "../../stores/identity";

    let isLoading: boolean = false;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);
    let exams: Exam[] = [];

    onMount(async () => {
        isLoading = true;
        const res = await fetch("http://localhost:10000/exams/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: identityString,
                username,
            }),
        });
        if (res.ok) {
            const apiRes = await res.json();
            const examArr: Record<string, any>[] = apiRes.exams;
            console.log(apiRes.exams);
            exams = examArr.map<Exam>((e) => ({
                ID: e.Record.ID,
                Date: new Date(e.Record.Date),
                Duration: e.Record.Duration,
                Title: e.Record.Title,
                Subject: e.Record.Subject,
                Live: e.Record.Live == "1",
                Examiner: e.Record.Examiner,
                Password: e.Record.Password,
                Address: e.Record.Address,
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
        <h1>All Exams</h1>
        <table>
            <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Title</th>
                <th>Subject</th>
                <th>Live</th>
                <th>Examiner</th>
                <th>Schedule</th>
            </tr>
            {#each exams as exam}
                <tr>
                    <td>{exam.ID}</td>
                    <td>{exam.Date}</td>
                    <td>{exam.Duration}</td>
                    <td>{exam.Title}</td>
                    <td>{exam.Subject}</td>
                    <td>{exam.Live ? "Yes" : "No"}</td>
                    <td>{exam.Examiner}</td>
                    <td>
                        <Link to={`/exams/${exam.ID}`}>Details</Link>
                    </td>
                </tr>
            {/each}
        </table>
    {/if}
</main>
