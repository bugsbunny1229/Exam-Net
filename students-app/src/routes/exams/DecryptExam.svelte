<script lang="ts">
    import { onMount } from "svelte";
    // let text = "";
    onMount(async () => {
        const infuraRes = await fetch(
            "https://ipfs.infura.io:5001/api/v0/cat?" +
                new URLSearchParams({
                    arg: "QmUucgGhBBARoYe6Z4632pFbQt9r1dGdg27mPgTYb3FQt1",
                }),
            {
                method: "POST",
            }
        );

        const ref = await infuraRes.blob();
        var a = document.createElement("a");
        a.href = URL.createObjectURL(ref);
        a.download = "file.dec";
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(a.href);
        document.body.removeChild(a);
        // text = ref;
    });
</script>

<!-- <p>{text}</p> -->
