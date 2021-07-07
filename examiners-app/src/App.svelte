<script lang="ts">
    import { Router, Link, Route } from "svelte-navigator";
    import EnrollForm from "./routes/EnrollForm.svelte";
    import ExamDetail from "./routes/exams/[id]/[id].svelte";
    import Schedule from "./routes/exams/[id]/Schedule.svelte";
    import Exams from "./routes/exams/Exams.svelte";
    import Login from "./routes/Login.svelte";
    import New from "./routes/exams/New.svelte";
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
                <Route path="/schedule">
                    <Schedule examId={params.id} />
                </Route>
                <Route path="/">
                    <ExamDetail examId={params.id} />
                </Route>
            </Route>
            <Route path="/new" component={New} />
        </Route>
    </main>
</Router>

<style>
</style>
