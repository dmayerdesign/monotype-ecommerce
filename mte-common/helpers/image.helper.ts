export class ImageHelper {
    private static getImageType(imageUrl: string, type: 'thumbnail' | 'medium' | 'large'): string {
        const types = [ 'thumbnail', 'medium', 'large' ]
        types.forEach((t) => {
            if (t !== type) {
                imageUrl = imageUrl.replace(`-${t}.`, `-${type}.`)
            }
        })
        return imageUrl
    }

    public static getThumbnailImage(imageUrl: string): string {
        return this.getImageType(imageUrl, 'thumbnail')
    }

    public static getMediumImage(imageUrl: string): string {
        return this.getImageType(imageUrl, 'medium')
    }

    public static getLargeImage(imageUrl: string): string {
        return this.getImageType(imageUrl, 'large')
    }
}
