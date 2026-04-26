import {makeAutoObservable} from "mobx";

export default class UserStore {
    constructor() {
        this._isAuth = false
        this._needsPasswordChange = false
        this._user = {}
        this._role = ""
        this._email = ""
        makeAutoObservable(this)
    }

    setIsAuth(bool) {
        this._isAuth = bool
    }
    setPasswordChange(bool) {
        this._needsPasswordChange = bool
    }
    setUser(user) {
        this._user = user
    }
    setRole(role_name) {
        this._role = role_name
    }
    setEmail(email) {
        this._email = email
    }

    get isAuth() {
        return this._isAuth
    }
    get passwordChange() {
        return this._needsPasswordChange
    }
    get user() {
        return this._user
    }
    get role() {
        return this._role
    }
    get email() {
        return this._email
    }
}