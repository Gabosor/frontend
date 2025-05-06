<script lang="ts" setup>
    const prices = [
        { producto: 'GNV', nacional: 1.66, inter: 3.01},
        { producto: 'DO', nacional: 3.72, inter: 8.88},
        { producto: 'GE', nacional: 3.74, inter: 8.68},
        { producto: 'GP', nacional: 4.79, inter: 0},
        { producto: 'SE92', nacional: 4.5, inter: 0},
        { producto: 'GE+', nacional: 3.74, inter: 8.68},
        { producto: 'GP+', nacional: 6.06, inter: 0},
        { producto: 'GUP100', nacional: 6.93, inter: 0},
        { producto: 'DO+', nacional: 3.72, inter: 0},
        { producto: 'DOULS+', nacional: 6.84, inter: 0},
    ]
</script>
<template>
    <div class=" mx-52"> 
        <table class=" w-full text-sm wfu text-left rtl:text-right">
            <thead class=" text-gray-700  bg-white border-gray-200 border-b">
                <tr>
                    <th scope="col" class="px-6 py-3" >Producto</th>
                    <th scope="col" class="px-6 py-3">Nacional</th>
                    <th scope="col" class="px-6 py-3">Internacional</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    class="bg-white border-b border-gray-200 text-gray-500"
                    v-for="price in prices"
                >    
                    <th class="px-6 py-4 " >{{ price.producto }}</th>
                    <th class="px-6 py-4">{{ price.nacional }}</th>
                    <th class="px-6 py-4">{{ price.inter }}</th>
                </tr>
            </tbody>
            
        </table>
    </div>
</template>
