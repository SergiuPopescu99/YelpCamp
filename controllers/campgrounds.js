const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary/index')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })

}

module.exports.renderNewForm = (req, res) => {

    res.render('campgrounds/new');

}

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) {
    //     throw new ExpressError('Invalid campground data!', 400);
    // }

    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const camp = new Campground(req.body.campground);

    if (!camp.geometry) {
        req.flash('error', 'Unable to find locattion!');
        return res.redirect('campgrounds/new');
    }
    camp.geometry = geodata.body.features[0].geometry;
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    camp.author = req.user._id;
    await camp.save();
    console.log(camp);
    req.flash('success', 'Successfully made a new Campground!')
    res.redirect(`/campgrounds/${camp._id}`);

}

module.exports.showCampground = async (req, res) => {

    const { id } = req.params;
    const camp = await Campground.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');

    if (!camp) {
        req.flash('error', 'Can not find the campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { camp })

}


module.exports.renderEditCampground = async (req, res) => {

    const { id } = req.params;
    const camp = await Campground.findById(id);

    if (!camp) {
        req.flash('error', 'Can not find the campground!');
        res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', { camp });
}

module.exports.updateCampground = async (req, res) => {

    const { id } = req.params;

    console.log(req.body);
    const camp1 = await Campground.findByIdAndUpdate(id, req.body.campground);
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp1.images.push(...imgs);
    await camp1.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp1.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(camp1)
    }
    req.flash('success', 'Successfully updated campground !');
    res.redirect(`/campgrounds/${camp1._id}`);
}

module.exports.deleteCampground = async (req, res) => {

    const { id } = req.params;
    const imageForDeletion = [];
    const deleteCamp = await Campground.findById(id);
    for (let img of deleteCamp.images) {
        imageForDeletion.push(img.filename);

    }
    for (let dimg of imageForDeletion) {
        await cloudinary.uploader.destroy(dimg);
    }
    await deleteCamp.remove();
    req.flash('success', 'Successfully deleted campground !');
    console.log(req.body)
    res.redirect('/campgrounds');


}