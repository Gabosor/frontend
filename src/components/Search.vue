<script lang="ts" setup>

</script>

<template>
    <div class="absolute w-full flex justify-center py-4 space-y-6 z-10 rounded-lg ">
        <FormKit
            type="form"
            :actions="false"
        >
            <div class="flex gap-28 mt-10">
                <FormKit
                    type="text"
                    :classes="{
                         input: '$reset border border-gray-300 rounded-lg py-2 px-10 w-full', 
                    }"
                />
                <FormKit
                    type="select"
                    :options="[
                        'Gasolina',
                        'Diesel',
                        'Diesel Plus'
                    ]"
                    :classes="{
                         input: '$reset border border-gray-300 rounded-lg py-2 px-10 w-full', 
                    }"
                />
                <FormKit
                    type="submit"
                >Buscar</FormKit>
            </div>
            
        </FormKit>
    </div>
</template>
