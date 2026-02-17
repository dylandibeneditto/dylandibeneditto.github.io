<div class="footer animate-on-load">
    <div class="hidden">
        <div class="name">Dylan DiBeneditto</div>
        <div class="title">Software Engineer</div>
        <div></div>
        <a class="email" href="mailto:dibenedittod@gmail.com" target="_blank"
            >dibenedittod@gmail.com</a
        >
        <a
            class="github"
            href="https://github.com/dylandibeneditto"
            target="_blank">github</a
        >
        <a class="photos" href="/photos" target="_blank">photos</a>
        <a class="resume" href="" tartget="_blank">resume</a>
    </div>
</div>

<style>
    .footer {
        width: 70vw;
        min-width: 780px;
        padding: 1rem;
        height: min-content;
        backdrop-filter: blur(2px);
    }

    .footer > * {
        width: 100%;
        display: grid;
        grid-template-columns: auto auto 1fr auto auto auto auto;
        gap: 3rem;
        padding-bottom: 5rem;
    }

    .footer > * > a {
        color: var(--secondary);
        text-decoration: none;
        transition: opacity 0.1s ease;
    }

    .footer > * > a:hover {
        opacity: 0.8;
    }

    @media (max-width: 900px) {
        .footer > * > :nth-child(1),
        .footer > * > :nth-child(2),
        .footer > * > :nth-child(3) {
            display: none;
        }

        .footer > * {
            grid-template-columns: auto auto auto auto;
        }
    }
</style>
