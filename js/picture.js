//TODO refactor Picture and Album into classes
class Picture{

    constructor (src, link, alt, dataLightbox, height, width) {
        this.src = src;
        this.link = link;
        this.alt = alt;
        this.height = height;
        this.width = width;
        this.dataLightbox = dataLightbox;
    }
}
module.exports = Picture;
