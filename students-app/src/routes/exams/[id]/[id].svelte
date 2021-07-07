<script lang="ts">
    import { get } from "svelte/store";
    import { usernameStore, identityStore } from "../../../stores/identity";

    export let examId: string;
    let isLoading: boolean = false;
    let correctPassword: boolean = false;
    let exam: Exam;
    let password: string;
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);

    const fetchData = async () => {
        isLoading = true;
        const res = await fetch(
            `http://localhost:10000/students/exams/${examId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: identityString,
                    username,
                    password,
                }),
            }
        );
        if (res.ok) {
            const examRes = (await res.json()).exam;
            exam = {
                ID: examRes.ID,
                Date: examRes.Date,
                Duration: examRes.Duration,
                Title: examRes.Title,
                Subject: examRes.Subject,
                Live: examRes.Live == "1",
                Examiner: examRes.Examiner,
                Password: examRes.Password,
                Address: examRes.Address,
            };
            correctPassword = true;
        } else {
            correctPassword = false;
        }
        isLoading = false;
    };
</script>

<main>
    {#if isLoading}
        <p>Loading...</p>
    {:else if !correctPassword}
        <form on:submit|preventDefault={fetchData}>
            <label for="password">Exam Password</label>
            <input
                type="password"
                placeholder="Exam Password"
                id="password"
                bind:value={password}
            />
            <input type="submit" value="Open Exam" />
        </form>
    {:else}
    <table>
        <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Duration</th>
            <th>Title</th>
            <th>Subject</th>
            <th>Live</th>
            <th>Examiner</th>
        </tr>
            <tr>
                <td>{exam.ID}</td>
                <td>{new Date(exam.Date)}</td>
                <td>{exam.Duration}</td>
                <td>{exam.Title}</td>
                <td>{exam.Subject}</td>
                <td>{exam.Live ? "Yes" : "No"}</td>
                <td>{exam.Examiner}</td>
            </tr>
    </table>
    {/if}
</main>
