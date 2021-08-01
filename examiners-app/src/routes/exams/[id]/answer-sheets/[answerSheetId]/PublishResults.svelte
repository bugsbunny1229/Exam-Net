<script lang="ts">
    import { pki, md } from "node-forge";
    import { get } from "svelte/store";
    import { answerSheetStore } from "../../../../../stores/answerSheet";
    import { usernameStore, identityStore } from "../../../../../stores/identity";

    let paper: FileList;
    let isLoading: boolean = false;
    const answerSheet: AnswerSheet = get(answerSheetStore);
    const username: string = get(usernameStore);
    const identityString: string = get(identityStore);

    const onSubmit = async () => {
        isLoading = true;
        const { privateKey } = JSON.parse(JSON.parse(identityString).identity);
        const examinerPrivateKey = pki.privateKeyFromPem(privateKey);

        const digest = md.sha512.create();
        const paperString = await paper[0].text();
        digest.update(paperString);

        const signature = examinerPrivateKey.sign(digest);

        const body = new FormData();
        body.append(paper[0].name, paper[0], paper[0].name);

        const infuraRes = await fetch(
            "https://ipfs.infura.io:5001/api/v0/add?quieter=true",
            {
                method: "POST",
                body,
            }
        );

        const infuraRef = await infuraRes.json();
        const res = await fetch(
            `http://localhost:10000/examiners/results/${answerSheet.ID}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    address: infuraRef.Hash,
                    signature,
                    username,
                    id: identityString,
                }),
            }
        );
        isLoading = false;
    };
</script>

<main>
    {#if isLoading}
        Loading...
    {:else}
        <form on:submit|preventDefault={onSubmit}>
            <input
                type="file"
                id="paper"
                name="paper"
                accept=".pdf"
                bind:files={paper}
                required
            />PDF
            <input type="submit" value="Submit" />
        </form>
    {/if}
</main>
