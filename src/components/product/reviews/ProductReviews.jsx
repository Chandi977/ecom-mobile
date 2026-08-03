import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import StarRating from './StarRating';
import ApiService from '../../../service/APIService';
import StorageService from '../../../utils/storageService';
import Colors from '../../../utils/Colors';
import { textScale, moderateScale } from '../../../utils/responsiveSize';

const PAGE_SIZE = 5;
const EMPTY_SUMMARY = { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

const formatDate = iso => {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

/**
 * ProductReviews — mobile ratings & reviews block for the product screen.
 * Mirrors the storefront: rating summary, verified-purchaser-gated write form,
 * and a paginated list with helpful votes and store replies.
 */
const ProductReviews = ({ productId, onRequireLogin }) => {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [reviews, setReviews] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPage = useCallback(
    async (nextSkip, replace) => {
      if (!productId) return;
      replace ? setLoading(true) : setLoadingMore(true);
      try {
        const res = await ApiService.GET_PRODUCT_REVIEWS(productId, { skip: nextSkip, limit: PAGE_SIZE, sort: 'recent' });
        const data = res?.data;
        if (data) {
          setSummary(data.summary || EMPTY_SUMMARY);
          setReviews(prev => (replace ? data.reviews || [] : [...prev, ...(data.reviews || [])]));
          setHasMore(res?.meta ? res.meta.hasMore : false);
          setSkip(nextSkip + (data.reviews?.length || 0));
        }
      } catch (e) {
        if (__DEV__) console.log('fetch reviews failed', e?.message);
      }
      replace ? setLoading(false) : setLoadingMore(false);
    },
    [productId],
  );

  const loadEligibility = useCallback(async () => {
    try {
      const stored = await StorageService.getItem('user_data');
      const isIn = !!stored;
      setLoggedIn(isIn);
      if (!isIn || !productId) {
        setEligibility(null);
        return;
      }
      const res = await ApiService.GET_REVIEW_ELIGIBILITY(productId);
      if (res?.data) setEligibility(res.data);
    } catch (e) {
      setEligibility(null);
    }
  }, [productId]);

  useEffect(() => {
    setReviews([]);
    setSkip(0);
    fetchPage(0, true);
  }, [fetchPage]);

  useEffect(() => {
    loadEligibility();
  }, [loadEligibility]);

  const resetForm = own => {
    setRating(own?.rating || 0);
    setTitle(own?.title || '');
    setComment(own?.comment || '');
  };

  const submit = async () => {
    if (!rating) {
      showMessage({ message: 'Please select a star rating.', type: 'warning' });
      return;
    }
    if (comment.trim().length < 3) {
      showMessage({ message: 'Please write a few words about the product.', type: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      const own = eligibility?.review;
      const payload = { rating, title: title.trim(), comment: comment.trim() };
      const res = showForm && own
        ? await ApiService.UPDATE_REVIEW(own._id, payload)
        : await ApiService.CREATE_REVIEW({ productId, ...payload });
      if (res?.success) {
        showMessage({ message: res.message || 'Review submitted.', type: 'success' });
        setShowForm(false);
        await loadEligibility();
        setReviews([]);
        setSkip(0);
        fetchPage(0, true);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Could not submit your review.';
      showMessage({ message: msg, type: 'danger' });
    }
    setSubmitting(false);
  };

  const voteHelpful = async review => {
    if (!loggedIn) {
      onRequireLogin?.();
      return;
    }
    try {
      const res = await ApiService.MARK_REVIEW_HELPFUL(review._id);
      const count = res?.data?.helpfulCount;
      if (count != null) {
        setReviews(prev => prev.map(r => (r._id === review._id ? { ...r, helpfulCount: count } : r)));
      }
    } catch (e) {
      if (__DEV__) console.log('helpful vote failed', e?.message);
    }
  };

  const own = eligibility?.review || null;
  const max = Math.max(1, ...Object.values(summary.distribution || {}).map(n => Number(n) || 0));

  const renderCta = () => {
    if (!loggedIn) {
      return (
        <TouchableOpacity style={styles.ctaBox} onPress={() => onRequireLogin?.()}>
          <Text style={styles.ctaText}>
            <Text style={{ color: Colors.brandColor, fontWeight: '700' }}>Log in</Text> to write a review. Only customers who purchased this product can review it.
          </Text>
        </TouchableOpacity>
      );
    }
    if (!eligibility) return null;

    if (showForm || (eligibility.canReview && !own)) {
      return (
        <View style={styles.formBox}>
          <Text style={styles.formTitle}>{own ? 'Edit your review' : 'Write a review'}</Text>
          <View style={styles.formRatingRow}>
            <Text style={styles.formLabel}>Your rating:</Text>
            <StarRating value={rating} onRate={setRating} size={22} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Title (optional)"
            placeholderTextColor={Colors.text_grey}
            value={title}
            maxLength={150}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Share your experience with this product…"
            placeholderTextColor={Colors.text_grey}
            value={comment}
            maxLength={3000}
            multiline
            onChangeText={setComment}
          />
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.submitBtn} disabled={submitting} onPress={submit}>
              {submitting ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>{own ? 'Update review' : 'Submit review'}</Text>
              )}
            </TouchableOpacity>
            {showForm ? (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={styles.note}>Reviews are checked before they appear publicly.</Text>
        </View>
      );
    }

    if (own) {
      return (
        <View style={styles.ctaBox}>
          <Text style={styles.ctaText}>
            You reviewed this product{own.status !== 'approved' ? ' — it’s awaiting approval.' : '.'}
          </Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              resetForm(own);
              setShowForm(true);
            }}
          >
            <Text style={styles.editBtnText}>Edit review</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!eligibility.verifiedPurchase) {
      return (
        <View style={styles.ctaBox}>
          <Text style={styles.ctaText}>Only customers who purchased this product can review it.</Text>
        </View>
      );
    }
    return null;
  };

  if (!productId) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Ratings & Reviews</Text>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
          <Text style={styles.avg}>{(summary.average || 0).toFixed(1)}</Text>
          <StarRating value={summary.average} size={18} />
          <Text style={styles.countText}>{summary.count} review{summary.count === 1 ? '' : 's'}</Text>
        </View>
        <View style={styles.summaryRight}>
          {[5, 4, 3, 2, 1].map(star => {
            const n = Number(summary.distribution?.[star]) || 0;
            const pct = summary.count > 0 ? Math.round((n / max) * 100) : 0;
            return (
              <View key={star} style={styles.distRow}>
                <Text style={styles.distLabel}>{star} ★</Text>
                <View style={styles.distTrack}>
                  <View style={[styles.distFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.distCount}>{n}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* CTA / form */}
      <View style={{ marginTop: moderateScale(14) }}>{renderCta()}</View>

      {/* List */}
      {loading ? (
        <ActivityIndicator style={{ marginVertical: moderateScale(20) }} color={Colors.brandColor} />
      ) : reviews.length === 0 ? (
        <Text style={styles.empty}>No reviews yet. Be the first to review this product.</Text>
      ) : (
        <View style={{ marginTop: moderateScale(10) }}>
          {reviews.map(r => (
            <View key={r._id} style={styles.item}>
              <View style={styles.itemHead}>
                <StarRating value={r.rating} size={14} />
                {r.title ? <Text style={styles.itemTitle}>{r.title}</Text> : null}
              </View>
              <View style={styles.itemMeta}>
                <Text style={styles.itemName}>{r.reviewerName || 'Customer'}</Text>
                {r.verifiedPurchase ? <Text style={styles.verified}>✓ Verified Purchase</Text> : null}
                <Text style={styles.itemDate}>{formatDate(r.createdAt)}</Text>
              </View>
              <Text style={styles.itemComment}>{r.comment}</Text>
              {r.adminReply?.message ? (
                <View style={styles.reply}>
                  <Text style={styles.replyHead}>Response from the store</Text>
                  <Text style={styles.replyText}>{r.adminReply.message}</Text>
                </View>
              ) : null}
              <TouchableOpacity style={styles.helpfulBtn} onPress={() => voteHelpful(r)}>
                <Text style={styles.helpfulText}>
                  👍 Helpful{r.helpfulCount > 0 ? ` (${r.helpfulCount})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {hasMore ? (
            <TouchableOpacity style={styles.loadMore} disabled={loadingMore} onPress={() => fetchPage(skip, false)}>
              {loadingMore ? (
                <ActivityIndicator color={Colors.brandColor} size="small" />
              ) : (
                <Text style={styles.loadMoreText}>Load more reviews</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: moderateScale(16), paddingVertical: moderateScale(18), backgroundColor: Colors.white },
  heading: { fontSize: textScale(17), fontWeight: '700', color: Colors.brandColor, marginBottom: moderateScale(14) },

  summaryRow: { flexDirection: 'row', alignItems: 'flex-start' },
  summaryLeft: { alignItems: 'center', marginRight: moderateScale(18), minWidth: moderateScale(90) },
  avg: { fontSize: textScale(34), fontWeight: '700', color: Colors.brandColor, lineHeight: textScale(38) },
  countText: { fontSize: textScale(11), color: Colors.text_grey, marginTop: moderateScale(4) },
  summaryRight: { flex: 1 },
  distRow: { flexDirection: 'row', alignItems: 'center', marginVertical: moderateScale(2) },
  distLabel: { fontSize: textScale(11), color: Colors.text_grey, width: moderateScale(28) },
  distTrack: { flex: 1, height: moderateScale(7), backgroundColor: '#f1f1f1', borderRadius: moderateScale(4), overflow: 'hidden' },
  distFill: { height: '100%', backgroundColor: '#f59e0b', borderRadius: moderateScale(4) },
  distCount: { fontSize: textScale(10), color: Colors.text_grey, width: moderateScale(22), textAlign: 'right' },

  ctaBox: { backgroundColor: Colors.backGround_grey, borderRadius: moderateScale(10), padding: moderateScale(12), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ctaText: { flex: 1, fontSize: textScale(12.5), color: '#4b5563', lineHeight: textScale(18) },
  editBtn: { borderWidth: 1, borderColor: Colors.brandColor, borderRadius: moderateScale(8), paddingHorizontal: moderateScale(12), paddingVertical: moderateScale(6), marginLeft: moderateScale(8) },
  editBtnText: { color: Colors.brandColor, fontWeight: '700', fontSize: textScale(12.5) },

  formBox: { backgroundColor: Colors.backGround_grey, borderRadius: moderateScale(12), padding: moderateScale(14) },
  formTitle: { fontSize: textScale(14.5), fontWeight: '700', color: Colors.brandColor, marginBottom: moderateScale(10) },
  formRatingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(12) },
  formLabel: { fontSize: textScale(12.5), color: '#4b5563', marginRight: moderateScale(8) },
  input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border_grey, borderRadius: moderateScale(8), paddingHorizontal: moderateScale(10), paddingVertical: moderateScale(8), fontSize: textScale(13), color: Colors.black, marginBottom: moderateScale(10) },
  textarea: { minHeight: moderateScale(80), textAlignVertical: 'top' },
  formActions: { flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(2) },
  submitBtn: { backgroundColor: Colors.brandColor, borderRadius: moderateScale(8), paddingHorizontal: moderateScale(18), paddingVertical: moderateScale(10), minWidth: moderateScale(120), alignItems: 'center' },
  submitBtnText: { color: Colors.white, fontWeight: '700', fontSize: textScale(13) },
  cancelBtn: { borderWidth: 1, borderColor: Colors.border_grey, borderRadius: moderateScale(8), paddingHorizontal: moderateScale(14), paddingVertical: moderateScale(10), marginLeft: moderateScale(8) },
  cancelBtnText: { color: '#4b5563', fontSize: textScale(13) },
  note: { fontSize: textScale(11), color: Colors.text_grey, marginTop: moderateScale(10) },

  empty: { textAlign: 'center', color: Colors.text_grey, fontSize: textScale(13), marginVertical: moderateScale(20) },

  item: { paddingVertical: moderateScale(14), borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemHead: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  itemTitle: { fontSize: textScale(13.5), fontWeight: '700', color: Colors.brandColor, marginLeft: moderateScale(8) },
  itemMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: moderateScale(4) },
  itemName: { fontSize: textScale(12.5), fontWeight: '600', color: '#374151', marginRight: moderateScale(8) },
  verified: { fontSize: textScale(10.5), fontWeight: '700', color: Colors.green, marginRight: moderateScale(8) },
  itemDate: { fontSize: textScale(11), color: Colors.text_grey },
  itemComment: { fontSize: textScale(13), color: '#4b5563', lineHeight: textScale(19), marginTop: moderateScale(6) },
  reply: { marginTop: moderateScale(8), marginLeft: moderateScale(8), paddingLeft: moderateScale(10), paddingVertical: moderateScale(6), paddingRight: moderateScale(10), borderLeftWidth: 2, borderLeftColor: Colors.brandColor, backgroundColor: '#f7f9fc', borderRadius: moderateScale(6) },
  replyHead: { fontSize: textScale(11.5), fontWeight: '700', color: Colors.brandColor, marginBottom: moderateScale(2) },
  replyText: { fontSize: textScale(12.5), color: '#4b5563' },
  helpfulBtn: { marginTop: moderateScale(8), alignSelf: 'flex-start' },
  helpfulText: { fontSize: textScale(12.5), color: Colors.text_grey },

  loadMore: { alignSelf: 'center', borderWidth: 1, borderColor: Colors.brandColor, borderRadius: moderateScale(8), paddingHorizontal: moderateScale(18), paddingVertical: moderateScale(9), marginTop: moderateScale(14) },
  loadMoreText: { color: Colors.brandColor, fontWeight: '700', fontSize: textScale(13) },
});

export default ProductReviews;
