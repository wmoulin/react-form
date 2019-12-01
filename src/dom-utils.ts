    /**
     * Initialise la valeur courante du champ de formulaire
     * @param value valeur à utiliser
     * @returns {DomAdapter} cette instance
     */
    export function setCurrentValue(elt, value: any): this {
      const strValue: string = (value != null && value.toString) ? value.toString() : "";
      if (Array.isArray(elt)) {
        for (let i = 0; i < elt.length; i++) {
            if (elt[ i ].value === strValue) {
              elt[ i ].checked = true;
            } else {
              elt[ i ].checked = false;
            }
        }
    } else if (elt) {
        let type: string = elt.type;
        if (type) {
            type = type.toLowerCase();
        }
          if (type === "text" || type === "number" || type === "textarea" || type === "hidden" || type === "checkbox"
              || (type === "select" && this.htmlElement.multiple === false)) {
              elt.value = (elt.dataset && this.htmlElement.dataset.multiple === "true")
                  ? (value ? JSON.stringify(value) : "")
                  : strValue;

          } else if (type === "select") {
              if (value instanceof Array) {
                elt.value = null;
                  value.forEach((val) => {
                      for (let i = 0; i < elt.options.length; i++) {
                          if (elt.options[ i ].value === val) {
                            elt.options[ i ].selected = true;
                              return;
                          }
                      }
                  });

              } else {
                elt.value = value;
              }
          }

      } 
  }

  /**
   * Renvoie la valeur courante du champ de formulaire
   * @param removeEmptyStrings {boolean} non utilisé ici, à conserver pour remonter valeur champs non valorisé d'un form
   * @returns {null}
   */
  export function getCurrentValue(removeEmptyStrings: boolean = true): any {
      let val: any = null;
      if (this.htmlElement) {
          let type: string = this.type;
          if (type) {
              type = type.toLowerCase();
          }
          if (type === "text" || type === "textarea" || type === "hidden"
              || (type === "select" && this.htmlElement.multiple === false)) {

              try {
                  if (Array.isArray(JSON.parse(this.htmlElement.value))) {
                      val = JSON.parse(this.htmlElement.value);
                  } else {
                      val = this.htmlElement.value;
                  }
              } catch (e) {
                  val = this.htmlElement.value;
              }
          } else if (type === "select"/*select multiple*/) {
              val = [];
              /* Note : l'attribut selectedOptions n'est pas supporté par Internet Explorer */
              for (let i = 0; i < (this.htmlElement as HTMLSelectElement).options.length; i++) {
                  const option: HTMLOptionElement = (this.htmlElement as HTMLSelectElement).options[ i ] as HTMLOptionElement;
                  if (option.selected) {
                      val.push(option.value);
                  }
              }
          } else if (type === "checkbox") {
              // Pas de valeur spécifique : la valeur est un booléen égal à checked
              val = this.htmlElement.checked;
          } else if (type === "file") {
              const fileList: FileList = this.htmlElement.files;
              if (fileList && fileList.length >= 1) {
                  /* Pour simplifier la validation et la transmission via super-agent,
                   un seul fichier par champ de type "file" est pris en compte */
                  val = fileList[ 0 ];
              } else {
                  /* Aucun fichier n'a été sélectionné : on récupère les informations de celui qui avait
                   éventuellement déjà été transmis */
                  // TODO à réactiver : voir pourquoi le composant UploadFileField ne peut être utilisé
                  val = FormUtils.extractFileData(this.htmlElement as HTMLInputElement);
              }
          } else if (type === "number") {
              val = this.htmlElement.valueAsNumber;
          }

      } else if (this.multipleElement) {
          for (let i = 0; i < this.multipleElement.length; i++) {
              if (this.multipleElement[ i ].checked) {
                  val = this.multipleElement[ i ].value;
                  break;
              }
          }
      }

      return val;
  }