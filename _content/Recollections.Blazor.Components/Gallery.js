﻿import PhotoSwipeLightbox from './photoswipe/photoswipe-lightbox.esm.js';

const options = {
    showHideAnimationType: 'none',
    pswpModule: './photoswipe.esm.js',
    pswpCSS: '/_content/Recollections.Blazor.Components/photoswipe/photoswipe.css'
};
const lightbox = new PhotoSwipeLightbox(options);
let isInitiazed = false;
let autoPlayTimer = null;
let stopCallback = () => { };

const playDurationSeconds = 4;
const playIcon = '<i class="fas fa-play"></i>';
const pauseIcon = '<i class="fas fa-pause"></i>';

function next(el) {
    if (lightbox.pswp.currIndex < lightbox.pswp.numItems - 1) {
        lightbox.pswp.next();
    } else {
        stop(el);
    }
}

function play(el) {
    autoPlayTimer = setInterval(() => next(el), playDurationSeconds * 1000);
    el.innerHTML = pauseIcon;
    lightbox.pswp.next();
}

function stop(el) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
    el.innerHTML = playIcon;

    stopCallback();
}

export function initialize(interop, images) {

    if (!isInitiazed) {
        lightbox.on('uiRegister', function () {
            lightbox.pswp.ui.registerElement({
                name: 'autoplay',
                order: 9,
                isButton: true,
                html: playIcon,
                onClick: (event, el) => {
                    lightbox.pswp.on('close', () => {
                        stop(el);
                    });

                    if (autoPlayTimer == null) {
                        play(el);
                    } else {
                        stop(el);
                    }
                }
            });

            lightbox.pswp.ui.registerElement({
                name: 'title',
                order: 9,
                isButton: false,
                appendTo: 'root',
                html: 'Caption text',
                onInit: (el, pswp) => {
                    lightbox.pswp.on('change', () => {
                        el.innerHTML = lightbox.pswp.currSlide.data.alt || '';
                    });
                }
            });

            lightbox.pswp.ui.registerElement({
                name: 'autoplay-progress',
                order: 9,
                isButton: false,
                appendTo: 'root',
                html: '',
                onInit: (el, pswp) => {
                    stopCallback = () => {
                        el.style.display = "none";
                    }

                    lightbox.pswp.on('change', () => {
                        if (autoPlayTimer != null) {
                            el.style.display = "block";
                            el.style.transition = "";
                            el.style.width = "0%";
                            el.offsetHeight;
                            el.style.transition = "width " + playDurationSeconds + "s linear";
                            el.style.width = "100%";
                        } else {
                            el.style.display = "none";
                        }
                    });
                }
            });
        });

        isInitiazed = true;
    }

    lightbox.on("numItems", (e) => {
        // Just for auto function.
        lightbox.pswp.numItems = images.length;

        e.numItems = images.length
    });

    lightbox.on("itemData", (e) => {
        e.itemData = {
            w: images[e.index].width,
            h: images[e.index].height,
            alt: images[e.index].title,
        }

        if (images[e.index].src) {
            e.itemData.src = images[e.index].src;
        } else if (images[e.index].provider) {
            e.itemData.provider = images[e.index].provider;
        } else {
            e.itemData.provider = images[e.index].provider = new Promise((resolve) => {
                interop.invokeMethodAsync("GetImageDataAsync", e.index).then(function (data) {
                    images[e.index].src = data;

                    console.log(`Loading image at index '${e.index}'`);
                    resolve(data);
                });
            });
        }
    });
    lightbox.init();
}

export function open(index) {
    lightbox.loadAndOpen(index);
}
