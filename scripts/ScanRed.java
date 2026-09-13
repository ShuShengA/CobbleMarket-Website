import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;

/** 扫描一个矩形区域，逐行输出"偏红像素"的 x 范围，用来精确定位凸起的边界。
 *  用法：java ScanRed.java <图> <x0> <y0> <x1> <y1> */
public class ScanRed {
    public static void main(String[] a) throws Exception {
        BufferedImage s = ImageIO.read(new File(a[0]));
        int x0 = Integer.parseInt(a[1]), y0 = Integer.parseInt(a[2]);
        int x1 = Integer.parseInt(a[3]), y1 = Integer.parseInt(a[4]);
        for (int y = y0; y <= y1; y += 2) {
            int lo = -1, hi = -1;
            for (int x = x0; x <= x1; x++) {
                int c = s.getRGB(x, y);
                int r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff;
                // 偏红：红明显高于绿蓝（放宽一点，把边缘也算进来）
                if (r > 120 && r > g * 1.6 && r > b * 1.6) {
                    if (lo < 0) lo = x;
                    hi = x;
                }
            }
            if (lo >= 0) System.out.printf("y=%4d  红 x=%4d..%4d  (宽 %d)%n", y, lo, hi, hi - lo + 1);
        }
    }
}
