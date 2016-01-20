/**
 * Dialog for selecting a phase by ID.
 */
imagespace.views.ImageDetailWidget = imagespace.View.extend({
    events: {
        'click .im-search-mod': function (event) {
            var query = $(event.currentTarget).attr('im-search');
            this.$el.modal('hide');
            imagespace.router.navigate('search/' + encodeURIComponent(query.replace('tiff:', 'tiff\\:')), {trigger: true});
        },

        'mouseenter .im-attribute': function (event) {
            $(event.target).closest('dd').find('.im-search-operations').removeClass('hidden');
        },

        'mouseleave .im-attribute': function (event) {
            $(event.target).closest('dd').find('.im-search-operations').addClass('hidden');
        },

        'click .prev-image': function (event) {
            if (this.canScroll) {
                this.parentView.$el.prev().find('.im-details:first').click();
            }
        },

        'click .next-image': function (event) {
            if (this.canScroll) {
                this.parentView.$el.next().find('.im-details:first').click();
            }
        }
    },

    initialize: function (settings) {
        this.image = settings.image || null;
        this.title = settings.title || 'Image details';

        // If it's being displayed in a grid/list as part of results, let the user
        // scroll through modals
        this.canScroll = this.parentView.parentView instanceof imagespace.views.SearchView;
    },

    _render: function () {
        var modal = this.$el.html(imagespace.templates.imageDetailWidget({
            title: this.title,
            image: this.image,
            query: $('.im-search').val(),
            stolenCameraPrefix: imagespace.stolenCameraPrefix,
            imagespace: imagespace,
            canScroll: this.canScroll,
            hasPrev: this.canScroll && this.parentView.$el.prev().length,
            hasNext: this.canScroll && this.parentView.$el.next().length,
            facetviewAdsUrl: imagespace.facetviewAdsUrl
        })).girderModal(this);

        $('.modal-body').css('height', $(window).height() * 0.8);
        $('.modal-body').css('overflow', 'auto');

        // Bizzare bug in FF causes the scrollbar to remember its position
        // https://bugzilla.mozilla.org/show_bug.cgi?id=706792
        $('.modal-body').scrollTop(0);

        modal.trigger($.Event('ready.girder.modal', {relatedTarget: modal}));

        return this;
    },

    render: function () {
        if (this.image.has('relevantAds')) {
            return this._render();
        } else {
            girder.restRequest({
                path: '/imagesearch/relevant_ads',
                data: {
                    solr_image_id: this.image.get('id')
                }
            }).done(_.bind(function (response) {
                this.image.set('relevantAds', _.map(response.ids, function (id) {
                    return _.last(id.split('/'));
                }));
                this._render();
            }, this));

            return this;
        }
    }
});
