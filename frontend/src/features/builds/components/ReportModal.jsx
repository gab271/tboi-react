/**
 * ReportModal Component
 * Modal for reporting posts, comments, or users
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaFlag, FaSpinner } from 'react-icons/fa';
import { Button } from '../../../components/ui/Button';
import { useReport } from '../hooks';
import { REPORT_REASONS, VALIDATION } from '../constants';

export function ReportModal({ isOpen, onClose, targetType, targetId }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reportMutation = useReport();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedReason) {
      setError('Please select a reason for your report');
      return;
    }

    if (details.length < VALIDATION.report.min) {
      setError(`Please provide at least ${VALIDATION.report.min} characters of detail`);
      return;
    }

    try {
      await reportMutation.mutateAsync({
        targetType,
        targetId,
        reason: selectedReason,
        details: details.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedReason('');
        setDetails('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    }
  };

  const handleClose = () => {
    onClose();
    setError('');
    setSelectedReason('');
    setDetails('');
    setSuccess(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-bg-paper border-4 border-text-ink p-6 shadow-[8px_8px_0_rgba(0,0,0,0.3)] max-w-md w-full"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-text-dim hover:text-text-ink transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            {success ? (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <FaFlag className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="font-heading text-xl text-text-heading mb-2">
                  REPORT SUBMITTED
                </h2>
                <p className="font-handwriting text-lg text-text-dim">
                  Thank you for helping keep the community safe.
                </p>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-accent-blood/10 rounded-full flex items-center justify-center">
                    <FaFlag className="w-5 h-5 text-accent-blood" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl text-text-heading">
                      REPORT {targetType.toUpperCase()}
                    </h2>
                    <p className="font-handwriting text-sm text-text-dim">
                      Help us maintain community standards
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-accent-blood/10 border border-accent-blood/30 text-accent-blood font-handwriting text-sm">
                    {error}
                  </div>
                )}

                {/* Reason Selection */}
                <div className="mb-4">
                  <label className="block font-handwriting text-lg font-bold text-text-dim mb-2">
                    Reason *
                  </label>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((reason) => (
                      <label
                        key={reason.value}
                        className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition-all ${
                          selectedReason === reason.value
                            ? 'border-accent-blood bg-accent-blood/5'
                            : 'border-text-ink/20 hover:border-text-ink/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={reason.value}
                          checked={selectedReason === reason.value}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedReason === reason.value
                            ? 'border-accent-blood'
                            : 'border-text-ink/40'
                        }`}>
                          {selectedReason === reason.value && (
                            <div className="w-2 h-2 rounded-full bg-accent-blood" />
                          )}
                        </div>
                        <span className="font-handwriting">{reason.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="mb-6">
                  <label className="block font-handwriting text-lg font-bold text-text-dim mb-2">
                    Additional Details *
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Please provide specific details about your concern..."
                    rows={4}
                    maxLength={VALIDATION.report.max}
                    className="w-full p-3 bg-bg-paper-dark border-2 border-text-ink/40 font-handwriting text-lg focus:outline-none focus:border-accent-blood resize-none"
                  />
                  <div className="text-right text-xs text-text-dim mt-1 font-pixel">
                    {details.length}/{VALIDATION.report.max}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <button
                    type="submit"
                    disabled={reportMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 font-pixel text-sm bg-accent-blood text-white border-2 border-accent-blood hover:bg-accent-blood/90 transition-all disabled:opacity-50"
                  >
                    {reportMutation.isPending ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaFlag />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ReportModal;
