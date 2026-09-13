import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;

/**
 * 把"红得发亮"的像素标白、其余标黑，用来一眼看出红色区域的分布。
 * 用法：java MaskRed.java <图> <输出> [R阈值=170] [G上限=90] [B上限=90]
 */
public class MaskRed {
    public static void main(String[] a) throws Exception {
        BufferedImage s = ImageIO.read(new File(a[0]));
        int rt = a.length > 2 ? Integer.parseInt(a[2]) : 170;
        int gt = a.length > 3 ? Integer.parseInt(a[3]) : 90;
        int bt = a.length > 4 ? Integer.parseInt(a[4]) : 90;
        int w = s.getWidth(), h = s.getHeight();
        BufferedImage o = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int c = s.getRGB(x, y);
                int r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff;
                o.setRGB(x, y, (r > rt && g < gt && b < bt) ? 0xffffff : 0x000000);
            }
        }
        ImageIO.write(o, "png", new File(a[1]));
        System.out.println("ok " + a[1]);
    }
}
