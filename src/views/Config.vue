<template>
    <div class="col-md-8">
        <h1 class="border-bottom pb-4 mb-4 mt-4">
            Configurações
        </h1>
        <div id="config" class="container">
            <div id="accordion">
                <div class="card bg-dark">
                    <div class="card-header" id="headingOne">
                        <h5 class="mb-0">
                            <button class="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                Idioma/Language
                            </button>
                        </h5>
                    </div>
                    <div id="collapseThree" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
                        <div class="card-body">
                            <div class="form-group">
                                <label for="lang">Selecione o Idioma/Select the Language:</label>
                                <select v-model="selectedLang" class="form-control" id="lang">
                                    <option value="1">Potuguês BR</option>
                                    <option value="2">English</option>
                                </select>
                            </div>
                            <button type="submit" @click="changeLang" class="btn btn-primary">Modificar/Change</button>
                        </div>
                    </div>
                </div>
                <div class="card bg-dark">
                    <div class="card-header" id="headingThree">
                        <h5 class="mb-0">
                            <button class="btn btn-link" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                {{ wordlist.config["CHANGE_EMAIL"][lang] }}
                            </button>
                        </h5>
                    </div>

                    <div id="collapseOne" class="collapse" aria-labelledby="headingThree" data-parent="#accordion">
                        <div class="card-body">
                            <div class="form-group">
                                <label for="exampleInputEmail1">{{ wordlist.config["NEW_EMAIL"][lang] }}</label>
                                <input type="email" v-model="newEmail" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" :placeholder="wordlist.config['NEW_EMAIL'][lang]">
                            </div>
                            <div class="form-group">
                                <label for="exampleInputPassword1">{{ wordlist.config["PASSWORD_CONFIRM"][lang] }}</label>
                                <input type="password" v-model="confirmPassword" class="form-control" id="exampleInputPassword1" :placeholder="wordlist.config['PASSWORD'][lang]">
                            </div>
                            <button type="submit" @click="changeEmail" class="btn btn-primary">{{ wordlist.config["CHANGE"][lang] }}</button>
                        </div>
                    </div>
                </div>
                <div class="card bg-dark">
                    <div class="card-header" id="headingTwo">
                        <h5 class="mb-0">
                            <button class="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                {{ wordlist.config["CHANGE_PASSWORD"][lang] }}
                            </button>
                        </h5>
                    </div>
                    <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordion">
                        <div class="card-body">
                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="changePassword-password">{{ wordlist.config["NEW_PASSWORD"][lang] }}</label>
                                    <input type="password" v-model="newPassword" class="form-control" id="changePassword-password" :placeholder="wordlist.config['NEW_PASSWORD'][lang]">
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="changePassword-password-repeat">{{ wordlist.config["REPEAT_PASSWORD"][lang] }}</label>
                                    <input type="password" v-model="repeatNewPassword" class="form-control" id="changePassword-password-repeat" 
                                    :placeholder="wordlist.config['REPEAT_PASSWORD'][lang]">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="x-confirmPassword">{{ wordlist.config["CONFIRM_CURRENT_PASSWORD"][lang] }}</label>
                                <input type="password" v-model="confirmPassword2" class="form-control" id="x-confirmPassword" :placeholder="wordlist.config['PASSWORD'][lang]">
                            </div>
                            <button type="submit" @click="changePassword" class="btn btn-primary">{{ wordlist.config["CHANGE"][lang] }}</button>
                        </div>
                    </div>
                </div>
                <div id="response"></div>
            </div>
        </div>
    </div>
</template>
<script>
    import $http from "@/api";

    export default {
        name: "Config",
        data: () => ({
            selectedLang: null,
            newEmail: null,
            newPassword: null,
            repeatNewPassword: null,
            confirmPassword: null,
            confirmPassword2: null
        }),
        methods: {
            changeLang () {
                if (!this.selectedLang)
                    return this.showError("EMPTY_INPUTS");

                $http.post("/account/settings", {
                    token: $Authentication.token.csrf,
                    lang: this.selectedLang,
                    type: 3
                }).then(response => this.changeLangResponse(response.data));
            },
            changeEmail () {
                if (!this.newEmail || !this.confirmPassword)
                    return this.showError("EMPTY_INPUTS");
                
                $http.post("/account/settings", {
                    token: $Authentication.token.csrf,
                    newEmail: this.newEmail,
                    password: this.confirmPassword,
                    type: 1
                })
                    .then(response => this.changeEmailResponse(response.data));
            },
            changePassword () {

                if (
                this.newPassword != this.repeatNewPassword ||
                (!this.newPassword || !this.repeatNewPassword)
                )
                    return this.showError("EMPTY_INPUTS");

                $http.post("/account/settings", {
                    token: $Authentication.token.csrf,
                    newPassword: this.newPassword,
                    password: this.confirmPassword2,
                    type: 2
                })
                    .then(response => this.changePasswordResponse(response.data));
            },

            changeLangResponse (data) {
                if (data.success)
                    location.reload();
            },

            changeEmailResponse (data) {
                this.newEmail = null;
                this.confirmPassword = null;

                if (data.error) {
                    switch (data.error) {
                        case 1: {
                            this.showError("EMPTY_INPUTS");
                            break;
                        };
                        
                        case 2: {
                            this.showError("EMAIL_IN_USE");
                            break;
                        };

                        case 3: {
                            this.showError("PASSWORD_NOT_EQUALS");
                            break;
                        };
                    };
                };

                if (data.success) {
                    this.showSuccess("CHANGE_SUCCESS");
                };
            },
            changePasswordResponse (data) {
                this.newPassword = null;
                this.repeatNewPassword = null;
                this.confirmPassword2 = null;

                if (data.error) {
                    switch (data.error) {
                        case 1: {
                            this.showError("EMPTY_INPUTS");
                            break;
                        };

                        case 2: {
                            this.showError("PASSWORD_NOT_EQUALS2");
                            break;
                        };
                    };
                };

                if (data.success) {
                    this.showSuccess("CHANGE_SUCCESS");
                };
            },
            showError (err) {
                const response = this.$el.querySelector("#response");
                response.innerHTML = "";
                const error = document.createElement("div");
                error.setAttribute("class", "alert alert-danger");
                error.innerHTML = this.wordlist.config[err][this.lang];
                response.appendChild(error);

                error.scrollIntoView({
                    behavior: "smooth"
                });

                setTimeout(() => {
                    error.parentNode.removeChild(error);
                }, 3000);
            },
            showSuccess (succ) {
                const response = this.$el.querySelector("#response");
                response.innerHTML = "";
                const success = document.createElement("div");
                success.setAttribute("class", "alert alert-success");
                success.innerHTML = this.wordlist.config[succ][this.lang];
                response.appendChild(success);

                success.scrollIntoView({
                    behavior: "smooth"
                });

                setTimeout(() => {
                    success.parentNode.removeChild(success);
                }, 3000);
            }
        }
    }
</script>
<style scoped>
    #config {
        margin-top: 20px;
    }

    button {
        color: #fff;
    }
</style>