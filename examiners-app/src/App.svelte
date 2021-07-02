<script lang="ts">
    import { Router, Link, Route } from "svelte-navigator";
    import EnrollForm from "./routes/EnrollForm.svelte";
    import ExamDetail from "./routes/exams/ExamDetail.svelte";
    import ExamList from "./routes/exams/ExamList.svelte";
    import Login from "./routes/Login.svelte";
    import NewExam from "./routes/exams/NewExam.svelte";
</script>

<Router>
    <nav>
        <Link to="/login">Login</Link>
        <Link to="/exams/new">New Exam</Link>
        <Link to="/exams">Exam List</Link>
    </nav>
    <main>
        <Route path="/" component={EnrollForm} />
        <Route path="/login" component={Login} />
        <Route path="/exams/*">
            <Route path="/" component={ExamList} />
            <Route path="/:id" let:params>
                <ExamDetail examId={params.id} />
            </Route>
            <Route path="/new" component={NewExam} />
        </Route>
    </main>
</Router>

<style>
</style>
