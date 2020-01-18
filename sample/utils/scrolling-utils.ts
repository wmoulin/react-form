export class ScrollingUtils {

    /**
    * Scroll vers le composant indiqué en prenant en compte le sticky header
    * @param {any} element element vers lequel scroller
    */
   public static smoothScrollToElementWithStickyHeader(element: any) {
        const banner = document.getElementById("banner");
        if (banner) {
            const bannerHeight = banner.scrollHeight;
            ScrollingUtils.smoothScrollToPosition( element.offsetTop - bannerHeight );
        }else {
            ScrollingUtils.smoothScrollToPosition( element.offsetTop );
        }
    }

    /**
    * Scroll vers le composant indiqué
    * @param {string} eID identifiant du composant vers lequel scroller
    */
    public static smoothScroll(eID: string) {
        const elm = document.getElementById(eID);
        if (!elm) return;
        const stopY = this.elmYPosition(elm);
        this.smoothScrollToPosition(stopY);
    }

    /**
    * Scroll vers le composant indiqué
    * @param {any} elm element vers lequel scroller
    */
    public static smoothScrollByElement(elm: any) {
        if (!elm) return;
        const stopY = this.elmYPosition(elm);
        this.smoothScrollToPosition(stopY);
    }

    /**
    * Scroll vers la position y indiquée
    * @param {number} yPoint position Y
    * @param {number} duration durée de la transition
    */
    private static scrollTo(yPoint: number, duration: number) {
        setTimeout(() => {
            window.scrollTo(0, yPoint);
        }, duration);
        return;
    }

    /**
    * Scroll vers la position y indiquée
    * @param {number} stopY position Y
    */
    public static smoothScrollToPosition(stopY: number) {
        const startY = this.currentYPosition();
        const distance = stopY > startY ? stopY - startY : startY - stopY;

        if (distance < 100) {
            window.scrollTo(0, stopY);
            return;
        }
        let speed = Math.round(distance / 100);
        if (speed >= 20) speed = 20;
        const step = Math.round(distance / 15);
        let leapY = stopY > startY ? startY + step : startY - step;
        let timer = 0;
        if (stopY > startY) {
            for (let i = startY; i < stopY; i += step) {
                this.scrollTo(leapY, timer * speed);
                leapY += step;
                if (leapY > stopY) leapY = stopY;
                timer++;
            }
            return;
        }
        for (let i = startY; i > stopY; i -= step) {
            this.scrollTo(leapY, timer * speed);
            leapY -= step;
            if (leapY < stopY) leapY = stopY;
            timer++;
        }
    }

    /**
    * Retourne la position Y actuelle
    */
    private static currentYPosition(): number {
        // Firefox, Chrome, Opera, Safari
        if (self.pageYOffset) {
            return self.pageYOffset;
        }

        // Internet Explorer 6 - standards mode
        if (document.documentElement && document.documentElement.scrollTop) {
            return document.documentElement.scrollTop;
        }
        // Internet Explorer 6, 7 and 8
        if (document.body.scrollTop) {
            return document.body.scrollTop;
        }

        return 0;
    }

    /**
    * Retourne la position Y de l'element
    * @param {any} elm element
    */
    private static elmYPosition(elm : any): number {
        let y: number = elm.offsetTop;
        let node = elm;
        while (node.offsetParent && node.offsetParent != document.body) {
            node = node.offsetParent;
            y += node.offsetTop;
        }
        return y;
    }
}
   