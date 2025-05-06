<script lang="ts" setup>

</script>

<template>
    <header
        class=" p-4 bg-blue-500"
    >
        <nav class=" flex justify-between items-center text-xl uppercase text-white">
            <RouterLink class=" flex items-center gap-3 cursor-pointer hover:text-blue-700 "
                :to="{name: 'view-map'}"
            >
                <img src="../../public/imageLogo.png" alt="imagen logo" class=" h-20 w-20">
                <p class=" font-black ">Estacion de Servicio</p>
            </RouterLink>
            <RouterLink href="" class="  font-bold  hover:text-blue-700"
                :to="{name: 'prices'}"
            >Ver Precios</RouterLink>
        </nav>
    </header>
</template>
