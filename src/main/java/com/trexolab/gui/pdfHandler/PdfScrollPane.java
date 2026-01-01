package com.trexolab.gui.pdfHandler;


import javax.swing.*;
import java.awt.*;
import java.util.function.Consumer;

/**
 * Wraps the PDF panel (pages inside) and updates page label based on scroll.
 */
public class PdfScrollPane extends JScrollPane {

    private final JPanel pdfPanel;      // The vertical BoxLayout host of pages
    private final JPanel wrapper;       // Centers pdfPanel horizontally
    private final PdfRendererService rendererService;
    private final Consumer<String> pageInfoUpdater;
    private PageChangeListener pageChangeListener;

    /**
     * Listener for page change events (provides current page and total pages).
     */
    public interface PageChangeListener {
        void onPageChanged(int currentPage, int totalPages);
    }

    public PdfScrollPane(PdfRendererService rendererService, Consumer<String> pageInfoUpdater) {
        this.rendererService = rendererService;
        this.pageInfoUpdater = pageInfoUpdater;

        pdfPanel = rendererService.getPdfPanel();
        wrapper = new JPanel(new FlowLayout(FlowLayout.CENTER, 0, 20));
        wrapper.add(pdfPanel);

        setViewportView(wrapper);
        setBorder(BorderFactory.createEmptyBorder());

        // Performance: Improved scroll speed for smoother navigation
        getVerticalScrollBar().setUnitIncrement(20);
        getVerticalScrollBar().setBlockIncrement(100);

        // Enable smooth scrolling performance
        getViewport().setScrollMode(JViewport.BACKINGSTORE_SCROLL_MODE);

        getVerticalScrollBar().addAdjustmentListener(e -> updateCurrentPageBasedOnScroll());
    }

    public JPanel getPdfPanel() {
        return pdfPanel;
    }

    /**
     * Sets the listener for page change events.
     */
    public void setPageChangeListener(PageChangeListener listener) {
        this.pageChangeListener = listener;
    }

    /**
     * Forces an update of the page display.
     * Useful when PDF is first loaded to ensure page number is shown.
     */
    public void forceUpdatePageDisplay() {
        // Ensure components are validated before updating
        wrapper.revalidate();
        pdfPanel.revalidate();

        // Use invokeLater to ensure layout is complete
        SwingUtilities.invokeLater(() -> {
            // Try multiple times with increasing delays to ensure components are ready
            tryUpdatePageDisplay(0);
        });
    }

    /**
     * Tries to update page display with retry logic to handle component initialization delays.
     */
    private void tryUpdatePageDisplay(int attempt) {
        int totalPages = rendererService.getPageCountSafe();

        // Check if components are ready
        if (totalPages > 0 && pdfPanel.getComponentCount() > 0) {
            Component firstPage = pdfPanel.getComponent(0);
            Rectangle bounds = firstPage.getBounds();
            Rectangle viewportRect = getViewport().getViewRect();

            // Check if bounds are valid (not zero)
            if (bounds.width > 0 && bounds.height > 0 && viewportRect.width > 0 && viewportRect.height > 0) {
                // Components are ready, update the display
                // Directly set page info instead of relying on scroll detection
                pageInfoUpdater.accept("Page: 1/" + totalPages);
                return;
            }
        }

        // Components not ready yet, retry with delay (max 15 attempts)
        if (attempt < 15) {
            int delay = 100; // Fixed 100ms delay
            Timer timer = new Timer(delay, e -> tryUpdatePageDisplay(attempt + 1));
            timer.setRepeats(false);
            timer.start();
        } else {
            // Final fallback - just set page 1
            if (totalPages > 0) {
                pageInfoUpdater.accept("Page: 1/" + totalPages);
            }
        }
    }

    private void updateCurrentPageBasedOnScroll() {
        int totalPages = rendererService.getPageCountSafe();
        if (totalPages <= 0 || pdfPanel.getComponentCount() == 0) {
            pageInfoUpdater.accept("");
            return;
        }

        Rectangle viewportRect = getViewport().getViewRect();
        int viewportTop = viewportRect.y;
        int viewportBottom = viewportRect.y + viewportRect.height;
        int viewportCenter = viewportRect.y + viewportRect.height / 2;

        int bestPage = 1;
        double bestVisibility = 0;

        // Find the page with the most visibility in the viewport
        // A page is considered "current" when at least 50% is visible
        for (int i = 0; i < totalPages; i++) {
            Component comp = pdfPanel.getComponent(i);
            Rectangle bounds = comp.getBounds();

            int pageTop = bounds.y;
            int pageBottom = bounds.y + bounds.height;

            // Calculate visible portion of this page
            int visibleTop = Math.max(pageTop, viewportTop);
            int visibleBottom = Math.min(pageBottom, viewportBottom);
            int visibleHeight = Math.max(0, visibleBottom - visibleTop);

            // Calculate visibility percentage
            double visibility = bounds.height > 0 ? (double) visibleHeight / bounds.height : 0;

            // Check if page center is in viewport (alternative: use which page covers viewport center)
            boolean pageCenterInViewport = (pageTop + bounds.height / 2) >= viewportTop
                                        && (pageTop + bounds.height / 2) <= viewportBottom;

            // Prefer the page whose center is closest to viewport center
            int pageCenter = pageTop + bounds.height / 2;
            int distanceToViewportCenter = Math.abs(pageCenter - viewportCenter);

            // Use visibility >= 50% or page center in viewport as criteria
            if (visibility >= 0.5 || pageCenterInViewport) {
                if (visibility > bestVisibility ||
                    (visibility == bestVisibility && distanceToViewportCenter < Math.abs((pdfPanel.getComponent(bestPage - 1).getBounds().y + pdfPanel.getComponent(bestPage - 1).getBounds().height / 2) - viewportCenter))) {
                    bestVisibility = visibility;
                    bestPage = i + 1;
                }
            }
        }

        // If no page has 50% visibility, find the page whose top is closest to viewport top
        if (bestVisibility < 0.5) {
            for (int i = 0; i < totalPages; i++) {
                Component comp = pdfPanel.getComponent(i);
                Rectangle bounds = comp.getBounds();
                if (bounds.y + bounds.height > viewportTop) {
                    bestPage = i + 1;
                    break;
                }
            }
        }

        pageInfoUpdater.accept("Page: " + bestPage + "/" + totalPages);

        // Notify page change listener
        if (pageChangeListener != null) {
            pageChangeListener.onPageChanged(bestPage, totalPages);
        }
    }

    /**
     * Scrolls the viewport to show the specified page (0-based index).
     * @param pageIndex The page index to scroll to (0-based)
     */
    public void scrollToPage(int pageIndex) {
        // Wait for the component to be laid out
        SwingUtilities.invokeLater(() -> {
            if (pageIndex >= 0 && pageIndex < pdfPanel.getComponentCount()) {
                Component page = pdfPanel.getComponent(pageIndex);
                Rectangle pageBounds = page.getBounds();

                // Get the viewport and its current view rectangle
                JViewport viewport = getViewport();
                Rectangle viewRect = viewport.getViewRect();

                // Calculate the target position to center the page
                int targetY = pageBounds.y - (viewRect.height - pageBounds.height) / 3; // 1/3 from top
                targetY = Math.max(0, targetY); // Don't scroll above the top

                // Scroll to the target position
                viewport.setViewPosition(new Point(0, targetY));

                // Update the page info
                updateCurrentPageBasedOnScroll();
            }
        });
    }
}

