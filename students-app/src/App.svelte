<script lang="ts">
    import { Router, Link, Route } from "svelte-navigator";
    import AnswerSheet from "./routes/exams/AnswerSheet.svelte";
    import EnrollForm from "./routes/EnrollForm.svelte";
    import Exams from "./routes/exams/Exams.svelte";
    import ExamDetail from "./routes/exams/[id]/[id].svelte";
    import Login from "./routes/Login.svelte";
    import Result from "./routes/results/[answerSheetId].svelte";
</script>

<Router>
    <nav>
        <Link to="/login">Login</Link>
        <Link to="/exams/new">New Exam</Link>
        <Link to="/exams">All Exams</Link>
    </nav>
    <main>
        <Route path="/" component={EnrollForm} />
        <Route path="/login" component={Login} />
        <Route path="/exams/*">
            <Route path="/" component={Exams} />
            <Route path="/:id/*" let:params>
                <Route path="/">
                    <ExamDetail examId={params.id} />
                </Route>
                <Route path="/results" component={Result} />
                <Route path="/submit">
                    <AnswerSheet examId={params.id} />
                </Route>
            </Route>
        </Route>
    </main>
</Router>

<style>
</style>
