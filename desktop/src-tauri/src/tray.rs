use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let show = MenuItemBuilder::new("Show QefasHub").id("show").build(app)?;
    let hide = MenuItemBuilder::new("Hide Window").id("hide").build(app)?;
    let quit = MenuItemBuilder::new("Quit Application").id("quit").build(app)?;

    let menu = MenuBuilder::new(app)
        .items(&[&show, &hide, &quit])
        .build()?;

    let builder = if let Some(icon) = app.default_window_icon().cloned() {
        TrayIconBuilder::new().icon(icon)
    } else {
        TrayIconBuilder::new()
    };

    let _tray = builder
        .tooltip("QefasHub Desktop")
        .menu(&menu)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "hide" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click { .. } = event {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(())
}
