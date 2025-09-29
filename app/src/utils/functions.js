export const scrollToElement = (ref) => {
    const { current } = ref
    if (current !== null) {
        current.scrollIntoView({ behavior: "smooth" })
    }
}
