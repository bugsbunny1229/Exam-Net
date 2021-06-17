<script lang="ts">
    import { Router, Link, Route } from "svelte-navigator";
    import Login from "./routes/Login.svelte";
    import NewExaminer from "./routes/NewExaminer.svelte";
</script>

<Router>
    <nav>
        <Link to="/examiners">Register an examiner</Link>
    </nav>
    <main>
        <Route path="/"><Login /></Route>
        <Route path="/examiners"><NewExaminer /></Route>
    </main>
</Router>
