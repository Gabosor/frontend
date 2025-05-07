import { generateClasses } from "@formkit/themes"

const config = {
    config: {
        classes: generateClasses({
             submit: {
                input: '$reset bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-bold w-full p-3 mt-10'
            }
        })
    }
}
export default config