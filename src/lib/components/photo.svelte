<script lang="ts">
    let { image, location, time } = $props();
</script>

<div class="photo animate-on-load">
    <img class="image" src={image} />
    <div class="metadata">
        <div class="location">{location}</div>
        <div class="time">{time}</div>
    </div>
</div>

<style>
    .photo {
        display: flex;
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
    }
</style>
