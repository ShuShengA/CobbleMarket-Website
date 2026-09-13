import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;

/**
 * 把图标（含 alpha）缩放到指定尺寸，合成到背景图的指定位置。
 * 用法：java CompositeIcon.java <背景图> <图标> <输出PNG> <x> <y> <w> <h>
 *
 * 为什么合成进图片而不是用 CSS 叠一层：封面背景是 background-size:cover，
 * 位置随窗口尺寸变、还带鼠标环视平移 —— 独立的一层永远对不齐，
 * 画进图里则天然跟着背景一起缩放/平移。
 */
public class CompositeIcon {
    public static void main(String[] a) throws Exception {
        BufferedImage bg = ImageIO.read(new File(a[0]));
        BufferedImage ic = ImageIO.read(new File(a[1]));
        int x = Integer.parseInt(a[3]), y = Integer.parseInt(a[4]);
        int w = Integer.parseInt(a[5]), h = Integer.parseInt(a[6]);

        BufferedImage out = new BufferedImage(bg.getWidth(), bg.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        g.drawImage(bg, 0, 0, null);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.drawImage(ic, x, y, w, h, null);
        g.dispose();

        ImageIO.write(out, "png", new File(a[2]));
        System.out.printf("合成 %s  图标画在 (%d,%d) %dx%d，底图 %dx%d%n",
                a[2], x, y, w, h, bg.getWidth(), bg.getHeight());
    }
}
