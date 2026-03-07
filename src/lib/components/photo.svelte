<script lang="ts">
    let { image, location, time } = $props();
</script>

<div class="photo animate-on-load hidden">
    <img class="image" src={image} />
    <div class="metadata animate-on-load">
        <div class="location hidden">{location}</div>
        <div class="time hidden">{time}</div>
    </div>
</div>

<style>
    .photo {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .image {
        border-radius: 15px;
        gap: 0.5rem;
        height: 100%;
        border: #8080801f 1px solid;

        @supports (corner-shape: squircle) {
            corner-shape: squircle;
            border-radius: 30px;
        }
    }

    .metadata {
        display: grid;
        grid-template-columns: 1fr auto;
        padding: 0rem 0.25rem;
    }
</style>
