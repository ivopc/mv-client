import Overworld from "./index";

// adicionar dialogo
Overworld.addDialog = function (text, callback, dontUnstopOnEnd) {

    // pausando movimentação do jogador
    this.player._data.stop = true;

    // esconder d-pad do mobile
    this.showHideDPad(false);

    // escolher se não vai liberar o player player de ficar parado quando acabar
    this.dontUnstopOnEndDialog = dontUnstopOnEnd;

    // setando que está dialogando
    this.currentAction = this.actions.dialog;
    // setando dialogo
    this.dialogCurrentText = text;
    // adicionando box de dialogo
    this.dialogCurrentSprite = this.add.sprite(0, this.sys.game.canvas.height - 60, "dialog")
        .setOrigin(0, 0)
        .setScrollFactor(0);
        
    this.dialogCurrentSprite.displayWidth = this.sys.canvas.width;
    this.containers.interface.add(this.dialogCurrentSprite);

    // mudar de dialogo lá
    if (this.isMobile) {
        this.dialogCurrentSprite.setInteractive();
        this.dialogCurrentSprite.on("pointerdown", () => this.nextDialog());
    };

    // adicionando texto do dialogo
    this.dialogCurrentRenderingText = this.add.text(7, this.dialogCurrentSprite.y + 6, "", {
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff",
        wordWrap: {
            width: this.sys.game.canvas.width - 10,
            useAdvancedWrap: true
        }
    });
    this.dialogCurrentRenderingText.setScrollFactor(0);
    this.containers.interface.add(this.dialogCurrentRenderingText);

    // adicionando callback
    this.dialogCallback = typeof(callback) == "function" ? callback : null;

    //console.log("fn do callback dialog", callback);

    // travando dialogo
    this.isDialogLocked = true;
    this.dialogTextIndex = 0;

    // animador do texto
    this.textAnimationTimer = this.time.addEvent({
        delay: this.dialogAnimationLetterTime,
        callback: this.animateDialog,
        callbackScope: this,
        loop: true
    });
    // flag do animador
    this.textAnimatorInProgress = true;

    // desbloqueando
    this.time.addEvent({delay: 300, callback: () => {
        this.isDialogLocked = false;
    }});
};

// ir para o próximo diálogo
Overworld.nextDialog = function () {

    // ve se troca de dialogo está bloqueada
    if (this.isDialogLocked)
        return;

    // bloqueia troca de dialogo
    this.isDialogLocked = true;

    // checa se está no último dialogo e se a animação não estiver em progresso
    if (this.dialogIndex == this.dialogCurrentText.length - 1 && !this.textAnimatorInProgress) {
        this.removeDialog();
        return;
    };

    // se dialogo estiver em progresso joga ele pro final
    if (this.textAnimatorInProgress) {
        // destrói timer
        this.textAnimationTimer.destroy();
        // seta texto inteiro
        this.dialogCurrentRenderingText.setText(this.dialogCurrentText[this.dialogIndex][this.lang]);
        // seta animator
        this.textAnimatorInProgress = false;
        // desbloqueia troca do dialogo em 300 m/s
        this.time.addEvent({delay: 300, callback: () =>{ 
            this.isDialogLocked = false;
        }});
    // se não estiver em progresso joga pro próximo
    } else {
        this.dialogCurrentRenderingText.setText("");
        this.dialogIndex ++;
        this.dialogTextIndex = 0;
        this.textAnimationTimer = this.time.addEvent({
            delay: this.dialogAnimationLetterTime,
            callback: this.animateDialog,
            callbackScope: this,
            loop: true
        });
        this.textAnimatorInProgress = true;

        // desbloqueia troca do dialogo em 300 m/s
        this.time.addEvent({delay: 300, callback: () => {
            this.isDialogLocked = false;
        }});
    };
};

Overworld.animateDialog = function () {
    // parar
    if (this.dialogCurrentText[this.dialogIndex][this.lang].length == this.dialogTextIndex) {
        this.textAnimationTimer.destroy();
        this.textAnimatorInProgress = false;
        return;
    };

    this.dialogCurrentRenderingText.setText(this.dialogCurrentRenderingText.text + this.dialogCurrentText[this.dialogIndex][this.lang][this.dialogTextIndex++]);
};

// remover dialogando
Overworld.removeDialog = function () {

    this.tweens.add({
        targets: [this.dialogCurrentSprite, this.dialogCurrentRenderingText],
        ease: "Linear",
        duration: 600,
        alpha: 0,
        onComplete: () => {

            // destruindo dialogo
            this.dialogCurrentSprite.destroy();
            this.dialogCurrentRenderingText.destroy();
            // despausando movimentação do jogador
            if (!this.dontUnstopOnEndDialog)
                this.player._data.stop = false;

            // limpando resto
            this.dialogIndex = 0;
            this.dialogTextIndex = 0;
            this.dialogCurrentSprite = null;
            this.dialogCurrentText =  null;
            this.dialogCurrentRenderingText = null;

            // setando para andar com um delay
            this.currentAction = this.actions.walking;

            // mostrar d-pad do mobile
            this.showHideDPad(true);

            

            // chamando callback
            if (typeof(this.dialogCallback) === "function")
                this.dialogCallback();

        }
    });
};

export default Overworld;