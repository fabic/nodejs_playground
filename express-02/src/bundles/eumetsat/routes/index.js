/* @flow */

export function IndexPage(router :Function) {
    router.get(/^.*$/, function(req, res, next) {
        let app = req.app
        let eumetsat = app.get('eumetsat')
        res.render('EUMetSat/index.html.njk', {
            title: 'Hello hello ?'
        })
    })
}