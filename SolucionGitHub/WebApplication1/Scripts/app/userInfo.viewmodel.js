function UserInfoViewModel(app, name, dataModel) {
    var self = this;

    // Datos
    self.name = ko.observable(name);

    // Operaciones
    self.logOff = function () {
        dataModel.logout().done(function () {
            app.navigateToLoggedOff();
        }).fail(function () {
            app.errors.push("Error al cerrar sesión.");
        });
    };

    self.manage = function () {
        app.navigateToManage();
    };
}
